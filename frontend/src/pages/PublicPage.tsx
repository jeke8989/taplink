import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPage } from '../api/page';
import type { PublicPageData } from '../api/page';

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

  const pageStyle: React.CSSProperties = {
    backgroundColor: pageData.backgroundColor || '#ffffff',
    color: pageData.fontColor || '#000000',
    fontFamily: pageData.fontFamily || 'Arial',
    minHeight: '100vh',
  };

  // Определяем, светлый или темный фон для правильного контраста
  const isLightBackground = 
    !pageData.backgroundColor || 
    pageData.backgroundColor === '#ffffff' || 
    pageData.backgroundColor.toLowerCase() === '#fff' ||
    (pageData.backgroundColor.startsWith('#') && 
     parseInt(pageData.backgroundColor.slice(1), 16) > 0xAAAAAA);

  const linkButtonStyle: React.CSSProperties = {
    color: pageData.fontColor || (isLightBackground ? '#1f2937' : '#ffffff'),
    borderColor: isLightBackground 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(255, 255, 255, 0.3)',
    backgroundColor: isLightBackground 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(255, 255, 255, 0.1)',
  };

  return (
    <div style={pageStyle} className="flex flex-col items-center justify-center py-12 px-4 min-h-screen">
      <div className="max-w-lg w-full space-y-8 text-center">
        {pageData.avatarUrl && (
          <div className="flex justify-center">
            <img
              src={pageData.avatarUrl}
              alt={pageData.displayName || 'Avatar'}
              className="w-32 h-32 rounded-full object-cover border-4 shadow-xl"
              style={{ 
                borderColor: isLightBackground 
                  ? 'rgba(0, 0, 0, 0.1)' 
                  : 'rgba(255, 255, 255, 0.2)' 
              }}
            />
          </div>
        )}

        {pageData.displayName && (
          <h1 
            className="text-5xl font-bold mb-2"
            style={{ color: pageData.fontColor || (isLightBackground ? '#111827' : '#ffffff') }}
          >
            {pageData.displayName}
          </h1>
        )}

        {pageData.bio && (
          <p 
            className="text-lg leading-relaxed whitespace-pre-line px-4"
            style={{ 
              color: pageData.fontColor 
                ? `${pageData.fontColor}dd` 
                : (isLightBackground ? '#4b5563' : '#e5e7eb'),
              opacity: 0.9 
            }}
          >
            {pageData.bio}
          </p>
        )}

        {pageData.links && pageData.links.length > 0 && (
          <div className="space-y-3 mt-10 px-4">
            {pageData.links.map((link, index: number) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 rounded-xl transition-all duration-300 border-2 font-medium text-lg shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={linkButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isLightBackground 
                    ? 'rgba(255, 255, 255, 1)' 
                    : 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = isLightBackground 
                    ? 'rgba(0, 0, 0, 0.3)' 
                    : 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = linkButtonStyle.backgroundColor as string;
                  e.currentTarget.style.borderColor = linkButtonStyle.borderColor as string;
                }}
              >
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

