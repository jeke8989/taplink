import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPage } from '../api/page';
import type { PublicPageData } from '../api/page';
import { BlockRenderer } from '../components/BlockEditor/BlockRenderer';

export const PublicPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState<PublicPageData | null>(null);

  const loadPage = useCallback(async () => {
    if (!username) return;
    
    try {
      const data = await getPublicPage(username);
      setPageData(data);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || 'Страница не найдена');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadPage();
    }
  }, [username, loadPage]);

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

  if (!pageData) {
    return null;
  }

  const renderLegacyContent = () => {
    const blocks: React.ReactNode[] = [];

    if (pageData.avatarUrl || pageData.displayName) {
      blocks.push(
        <div key="legacy-avatar" className="flex flex-col items-center text-center py-4">
          {pageData.avatarUrl && (
            <img
              src={pageData.avatarUrl}
              alt={pageData.displayName || 'Avatar'}
              className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-white/30"
            />
          )}
          {pageData.displayName && (
            <div className="font-bold text-lg">{pageData.displayName}</div>
          )}
          {pageData.bio && (
            <div className="text-sm opacity-80 whitespace-pre-line">
              {pageData.bio}
            </div>
          )}
        </div>,
      );
    }

    if (pageData.links && pageData.links.length > 0) {
      blocks.push(
        <div key="legacy-links" className="space-y-3">
          {pageData.links.map((link, index) => (
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

  const blocksToRender =
    pageData.blocks && pageData.blocks.length > 0
      ? pageData.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            type={block.type}
            content={block.content}
            isEditing={false}
          />
        ))
      : renderLegacyContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0f25] to-[#7b1334] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">{blocksToRender}</div>
    </div>
  );
};

