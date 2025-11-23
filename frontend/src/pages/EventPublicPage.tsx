import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventPage } from '../api/page';
import type { EventPageData } from '../api/page';
import { BlockRenderer } from '../components/BlockEditor/BlockRenderer';

export const EventPublicPage: React.FC = () => {
  const { username, eventSlug } = useParams<{ username: string; eventSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageData, setPageData] = useState<EventPageData | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPage = useCallback(async () => {
    if (!username || !eventSlug || hasLoaded) return;
    
    setHasLoaded(true);
    try {
      const data = await getEventPage(username, eventSlug);
      setPageData(data);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || 'Страница мероприятия не найдена');
    } finally {
      setLoading(false);
    }
  }, [username, eventSlug, hasLoaded]);

  useEffect(() => {
    if (username && eventSlug && !hasLoaded) {
      loadPage();
    }
  }, [username, eventSlug, loadPage, hasLoaded]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-lg text-white/80">Загрузка...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="rounded-2xl bg-white/5 border border-red-500/40 px-6 py-4 text-red-100 max-w-md text-center">
            {error}
          </div>
        </div>
      );
    }

    if (!pageData) {
      return null;
    }

    return (
      <main className="max-w-5xl mx-auto px-4 pb-10">
        <div className="mt-6 md:mt-10">
          <div className="relative">
            <div className="absolute inset-x-1/2 -translate-x-1/2 -top-3 h-1 w-24 rounded-full bg-white/40" />
            <div className="rounded-[32px] bg-gradient-to-b from-[#2a0f25] to-[#7b1334] px-5 py-8 shadow-2xl md:px-10 md:py-10">
              {pageData.title && (
                <header className="mb-6 md:mb-8 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {pageData.title}
                  </h1>
                  {pageData.description && (
                    <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto md:mx-0">
                      {pageData.description}
                    </p>
                  )}
                </header>
              )}

              <section className="space-y-4 md:space-y-5">
                {pageData.blocks && pageData.blocks.length > 0 ? (
                  pageData.blocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      type={block.type}
                      content={block.content}
                      isEditing={false}
                    />
                  ))
                ) : (
                  <div className="text-center text-white/70 py-12 text-sm">
                    Мероприятие пока не содержит блоков.
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={username ? `/${username}` : '/'}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            BioHub
          </Link>
          {username && (
            <span className="text-xs text-white/50 truncate max-w-[50%]">
              @{username}
            </span>
          )}
        </div>
      </header>

      {renderContent()}
    </div>
  );
};

