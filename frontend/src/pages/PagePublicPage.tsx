import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/page';
import type { PagePublicData } from '../api/page';
import { BlockRenderer } from '../components/BlockEditor/BlockRenderer';

import { getPublicPage } from '../api/page';
import type { PublicPageData } from '../api/page';

export const PagePublicPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState<PagePublicData | null>(null);
  const [publicPageData, setPublicPageData] = useState<PublicPageData | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPage = useCallback(async () => {
    if (!identifier || hasLoaded) return;
    
    setHasLoaded(true);
    try {
      // Сначала пытаемся загрузить страницу по slug
      try {
        const data = await getPageBySlug(identifier);
        setPageData(data);
      } catch (slugError) {
        // Если не найдено по slug, пытаемся загрузить главную страницу пользователя по username
        try {
          const publicData = await getPublicPage(identifier);
          setPublicPageData(publicData);
        } catch (usernameError) {
          setError('Страница не найдена');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || 'Страница не найдена');
    } finally {
      setLoading(false);
    }
  }, [identifier, hasLoaded]);

  useEffect(() => {
    if (identifier && !hasLoaded) {
      loadPage();
    }
  }, [identifier, loadPage, hasLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const renderLegacyContent = () => {
    if (!publicPageData) return null;
    
    const blocks: React.ReactNode[] = [];

    if (publicPageData.avatarUrl || publicPageData.displayName) {
      blocks.push(
        <div key="legacy-avatar" className="flex flex-col items-center text-center py-4">
          {publicPageData.avatarUrl && (
            <img
              src={publicPageData.avatarUrl}
              alt={publicPageData.displayName || 'Avatar'}
              className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-white/30"
            />
          )}
          {publicPageData.displayName && (
            <div className="font-bold text-lg">{publicPageData.displayName}</div>
          )}
          {publicPageData.bio && (
            <div className="text-sm opacity-80 whitespace-pre-line">
              {publicPageData.bio}
            </div>
          )}
        </div>,
      );
    }

    if (publicPageData.links && publicPageData.links.length > 0) {
      blocks.push(
        <div key="legacy-links" className="space-y-3">
          {publicPageData.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white bg-opacity-10 hover:bg-opacity-20 transition-all px-6 py-4 rounded-2xl text-center"
            >
              {link.title}
            </a>
          ))}
        </div>,
      );
    }

    return blocks.length ? blocks : null;
  };

  const renderContent = () => {
    if (pageData) {
      if (pageData.blocks && pageData.blocks.length > 0) {
        return pageData.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            type={block.type}
            content={block.content}
            isEditing={false}
          />
        ));
      }
      return (
        <div className="text-center py-12 text-white/60">
          Страница пуста
        </div>
      );
    }

    if (publicPageData) {
      const blocksToRender =
        publicPageData.blocks && publicPageData.blocks.length > 0
          ? publicPageData.blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                type={block.type}
                content={block.content}
                isEditing={false}
              />
            ))
          : renderLegacyContent();

      return blocksToRender;
    }

    return null;
  };

  if (!pageData && !publicPageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0f25] to-[#7b1334] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        {pageData && (
          <>
            {pageData.title && (
              <h1 className="text-2xl font-bold text-center mb-4">{pageData.title}</h1>
            )}
            {pageData.description && (
              <p className="text-center text-white/80 mb-6">{pageData.description}</p>
            )}
          </>
        )}
        {renderContent()}
      </div>
      <a
        href="/register"
        className="mt-8 flex items-center gap-1.5 text-[10px] text-white/60 hover:text-white transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
          B
        </span>
        <span className="tracking-[0.15em] uppercase text-white font-semibold">
          BioHub
        </span>
        <span className="text-white/50">— Создай свою страницу</span>
      </a>
    </div>
  );
};

