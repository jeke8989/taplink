import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Copy,
  Eye,
  Settings as SettingsIcon,
  Calendar,
  Clock,
} from 'lucide-react';
import type { Page, PageStats } from '../api/pages';
import { getPageStats } from '../api/pages';
import { ConfirmModal } from './ConfirmModal';

interface PagesListProps {
  pages: Page[];
  onEditPage: (pageId: string) => void;
  onEditPageSettings?: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onViewPage: (page: Page) => void;
  username: string | null;
}

export const PagesList: React.FC<PagesListProps> = ({
  pages,
  onEditPage,
  onEditPageSettings,
  onDeletePage,
  onViewPage,
  username,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [stats, setStats] = useState<Record<string, PageStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; pageId: string; pageTitle: string } | null>(null);

  useEffect(() => {
    // Загружаем статистику для всех страниц
    pages.forEach((page) => {
      if (!stats[page.id] && !loadingStats[page.id]) {
        setLoadingStats((prev) => ({ ...prev, [page.id]: true }));
        getPageStats(page.id)
          .then((pageStats) => {
            setStats((prev) => ({ ...prev, [page.id]: pageStats }));
          })
          .catch((error) => {
            console.error(`Error loading stats for page ${page.id}:`, error);
          })
          .finally(() => {
            setLoadingStats((prev) => ({ ...prev, [page.id]: false }));
          });
      }
    });
  }, [pages, stats, loadingStats]);

  const buildPageUrl = (page: Page) => {
    const baseUrl = window.location.origin;
    if (page.slug) {
      return `${baseUrl}/${page.slug}`;
    }
    // Для главной страницы (slug = null) используем username
    if (username) {
      return `${baseUrl}/${username}`;
    }
    return '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Можно добавить уведомление об успешном копировании
    });
  };

  const pageStats = (pageId: string): PageStats => {
    return stats[pageId] || { today: 0, last7Days: 0, last30Days: 0 };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Если сегодня
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) return 'только что';
        return `${diffMinutes} ${diffMinutes === 1 ? 'минуту' : diffMinutes < 5 ? 'минуты' : 'минут'} назад`;
      }
      return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    }

    // Если вчера
    if (diffDays === 1) {
      return 'вчера';
    }

    // Если на этой неделе
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
    }

    // Если в этом году
    if (date.getFullYear() === now.getFullYear()) {
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    // Полная дата
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-2">
      {pages.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          Нет страниц. Создайте первую страницу.
        </div>
      ) : (
        pages.map((page) => {
          const pageUrl = buildPageUrl(page);
          const statsData = pageStats(page.id);

          return (
            <div
              key={page.id}
              onClick={() => onEditPage(page.id)}
              className="bg-white/5 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-white/5"
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left side: Title, URL and Dates */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <h3 className="text-base font-semibold text-white truncate">{page.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
                      <ExternalLink size={12} />
                      <span className="truncate">{pageUrl || 'Ссылка недоступна'}</span>
                      {pageUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(pageUrl);
                          }}
                          className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          title="Копировать ссылку"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <div className="flex items-center gap-1.5" title={formatFullDate(page.createdAt)}>
                        <Calendar size={11} className="text-white/30" />
                        <span>Создана {formatDate(page.createdAt)}</span>
                      </div>
                      {page.updatedAt !== page.createdAt && (
                        <div className="flex items-center gap-1.5" title={formatFullDate(page.updatedAt)}>
                          <Clock size={11} className="text-white/30" />
                          <span>Изменена {formatDate(page.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Stats and Menu */}
                  <div className="flex items-center gap-3">
                    {/* Compact Stats */}
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{loadingStats[page.id] ? '...' : statsData.today}</span>
                      </div>
                      <div className="text-white/40">•</div>
                      <span>{loadingStats[page.id] ? '...' : statsData.last7Days}</span>
                      <div className="text-white/40">•</div>
                      <span>{loadingStats[page.id] ? '...' : statsData.last30Days}</span>
                    </div>

                    {/* Context Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const button = e.currentTarget;
                          const rect = button.getBoundingClientRect();
                          setMenuPosition({ x: rect.right, y: rect.bottom });
                          setMenuOpenId(menuOpenId === page.id ? null : page.id);
                        }}
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {/* Fixed Context Menu */}
      {menuOpenId && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setMenuOpenId(null);
              setMenuPosition(null);
            }}
          />
          <div
            className="fixed z-[101] bg-gray-800 border border-white/20 rounded-lg shadow-xl min-w-[180px] overflow-hidden"
            style={{
              top: `${menuPosition.y + 4}px`,
              right: `${window.innerWidth - menuPosition.x}px`,
            }}
          >
            {pages
              .filter((p) => p.id === menuOpenId)
              .map((page) => {
                const pageUrl = buildPageUrl(page);
                return (
                  <React.Fragment key={page.id}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPage(page.id);
                        setMenuOpenId(null);
                        setMenuPosition(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 size={16} />
                      Редактировать
                    </button>
                    {onEditPageSettings && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPageSettings(page.id);
                          setMenuOpenId(null);
                          setMenuPosition(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                      >
                        <SettingsIcon size={16} />
                        Настройки
                      </button>
                    )}
                    {username && (
                      <>
                        <div className="h-px bg-white/10" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPage(page);
                            setMenuOpenId(null);
                            setMenuPosition(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Открыть
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(pageUrl);
                            setMenuOpenId(null);
                            setMenuPosition(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <Copy size={16} />
                          Копировать ссылку
                        </button>
                      </>
                    )}
                    <div className="h-px bg-white/10" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ isOpen: true, pageId: page.id, pageTitle: page.title });
                        setMenuOpenId(null);
                        setMenuPosition(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={confirmDelete?.isOpen || false}
        title="Удалить страницу?"
        message={`Вы уверены, что хотите удалить страницу "${confirmDelete?.pageTitle}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={() => {
          if (confirmDelete) {
            onDeletePage(confirmDelete.pageId);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

