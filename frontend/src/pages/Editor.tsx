import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Eye,
  Settings as SettingsIcon,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { Block } from '../api/blocks';
import { BlockType, getBlocks, createBlock, updateBlock, deleteBlock, reorderBlocks } from '../api/blocks';
import type { UserProfile } from '../api/profile';
import {
  getMyProfile,
  updateMyProfile,
  checkUsernameAvailability,
} from '../api/profile';
import type { Page, UpdatePageDto } from '../api/pages';
import { getPages, createPage, updatePage, deletePage } from '../api/pages';
import { AddBlockModal } from '../components/BlockEditor/AddBlockModal';
import { BlockRenderer } from '../components/BlockEditor/BlockRenderer';
import { PageSettingsModal as ProfileSettingsModal, type UsernameStatus } from '../components/PageSettings/PageSettingsModal';
import type { PageSettings } from '../components/PageSettings/types';
import { defaultPageSettings } from '../components/PageSettings/types';
import { PagesList } from '../components/PagesList';
import { PageSettingsModal } from '../components/PageSettingsModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast, type ToastType } from '../components/Toast';

interface SortableBlockProps {
  block: Block;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onContentChange: (content: Record<string, unknown>) => void;
  editingContent: Record<string, unknown>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isMobile?: boolean;
}

const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onContentChange,
  editingContent,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isMobile = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: isMobile });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
        {isMobile ? (
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`p-1 rounded transition-colors ${
                canMoveUp
                  ? 'text-blue-400 hover:bg-blue-500/20'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Переместить вверх"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`p-1 rounded transition-colors ${
                canMoveDown
                  ? 'text-blue-400 hover:bg-blue-500/20'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Переместить вниз"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        ) : (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
          >
            <GripVertical size={20} />
          </button>
        )}
        <div className="flex-1 text-sm text-gray-300 uppercase tracking-wide">
          {block.type.replace('_', ' ').toUpperCase()}
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                onClick={onCancel}
                className="p-1 text-gray-400 hover:bg-white/10 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4">
        <BlockRenderer
          type={block.type}
          content={isEditing ? editingContent : block.content}
          isEditing={isEditing}
          onChange={onContentChange}
        />
      </div>
    </div>
  );
};

export const Editor: React.FC = () => {
  const { logout } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPageSettingsModal, setShowPageSettingsModal] = useState(false);
  const [pageSettings, setPageSettings] =
    useState<PageSettings>(defaultPageSettings);
  const [host, setHost] = useState('');
  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState(
    'Введите никнейм',
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] =
    useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<{ isOpen: boolean; blockId: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.origin);
      
      // Определяем мобильное устройство
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const buildPublicUrl = useCallback(
    (username: string) => {
      const cleanHost = host ? host.replace(/\/$/, '') : '';
      const cleanUsername = (username || '').replace(/^\/+/, '');
      if (!cleanHost) {
        return `/${cleanUsername}`;
      }
      return cleanUsername ? `${cleanHost}/${cleanUsername}` : cleanHost;
    },
    [host],
  );

  useEffect(() => {
    if (!host) return;
    setPageSettings((prev) => ({
      ...prev,
      pageUrl: buildPublicUrl(prev.username),
    }));
  }, [host, buildPublicUrl]);

  const loadBlocks = useCallback(async (pageId?: string | null) => {
    try {
      const data = await getBlocks(pageId);
      console.log('Loaded blocks:', data.length, data, 'pageId:', pageId);
      setBlocks(data);
    } catch (error) {
      console.error('Error loading blocks:', error);
      // Показываем ошибку пользователю
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { status?: number; data?: { message?: string } } }).response;
        if (response?.status === 401) {
          console.error('Unauthorized - please login again');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPages = useCallback(async () => {
    try {
      const data = await getPages();
      setPages(data);
      // Если нет выбранной страницы и есть страницы, выбираем первую (или главную с slug=null)
      if (data.length > 0) {
        setSelectedPageId((prev) => {
          if (prev) return prev;
          const mainPage = data.find(p => p.slug === null) || data[0];
          return mainPage.id;
        });
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setPageSettings((prev) => ({
        ...prev,
        username: data.username || prev.username,
        pageName: data.displayName || prev.pageName,
        seoTitle: data.displayName
          ? `${data.displayName} at BioHub`
          : prev.seoTitle,
        pageUrl: buildPublicUrl(data.username || prev.username),
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [buildPublicUrl]);
  useEffect(() => {
    const initialize = async () => {
      await loadProfile();
      await loadPages();
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      loadBlocks(selectedPageId);
    } else {
      setBlocks([]);
    }
  }, [selectedPageId, loadBlocks]);

  // Создание дефолтной страницы если её нет
  useEffect(() => {
    const ensureDefaultPage = async () => {
      if (pages.length === 0 && profile && !loading) {
        try {
          const defaultPage = await createPage({
            title: 'Главная страница',
            slug: null,
            description: null,
          });
          setPages([defaultPage]);
          setSelectedPageId(defaultPage.id);
        } catch (error) {
          console.error('Error creating default page:', error);
        }
      }
    };
    ensureDefaultPage();
  }, [pages.length, profile, loading]);
  useEffect(() => {
    if (!showSettingsModal) {
      setUsernameStatus('idle');
      setUsernameMessage('Введите никнейм');
      return;
    }

    const candidate = (pageSettings.username || '').trim();
    if (!candidate) {
      setUsernameStatus('error');
      setUsernameMessage('Введите никнейм');
      return;
    }

    if (profile && candidate === (profile.username || '')) {
      setUsernameStatus('available');
      setUsernameMessage('Это ваш текущий никнейм');
      return;
    }

    // Увеличиваем debounce до 2 секунд, чтобы не проверять после каждого символа
    setUsernameStatus('checking');
    setUsernameMessage('Проверяем доступность…');
    const timeout = setTimeout(() => {
      // Проверяем, что значение не изменилось за время ожидания
      const currentCandidate = (pageSettings.username || '').trim();
      if (currentCandidate !== candidate) {
        return; // Значение изменилось, пропускаем проверку
      }

      checkUsernameAvailability(currentCandidate)
        .then((available) => {
          // Проверяем еще раз, что значение не изменилось
          const latestCandidate = (pageSettings.username || '').trim();
          if (latestCandidate !== currentCandidate) {
            return; // Значение изменилось, игнорируем результат
          }

          if (available) {
            setUsernameStatus('available');
            setUsernameMessage('Никнейм свободен');
          } else {
            setUsernameStatus('taken');
            setUsernameMessage('Никнейм уже занят');
          }
        })
        .catch((error) => {
          console.error('Error checking username', error);
          const latestCandidate = (pageSettings.username || '').trim();
          if (latestCandidate === candidate) {
            setUsernameStatus('error');
            setUsernameMessage('Не удалось проверить никнейм');
          }
        });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [pageSettings.username, showSettingsModal, profile]);
  const handleUsernameChange = (value: string) => {
    setPageSettings((prev) => ({
      ...prev,
      username: value,
      pageUrl: buildPublicUrl(value),
    }));
  };

  const handleSavePageSettings = async (settings: PageSettings) => {
    setIsSavingSettings(true);
    try {
      if (
        profile &&
        settings.username &&
        settings.username !== (profile.username || '')
      ) {
        await updateMyProfile({ username: settings.username });
        setProfile({ ...profile, username: settings.username });
      }
      setPageSettings({
        ...settings,
        pageUrl: buildPublicUrl(settings.username),
      });
      setShowSettingsModal(false);
      setUsernameStatus('idle');
    } catch (error) {
      console.error('Error saving page settings', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setUsernameStatus('idle');
    setUsernameMessage('Введите никнейм');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);

      try {
        await reorderBlocks(newBlocks.map((b) => b.id), selectedPageId);
      } catch (error) {
        console.error('Error reordering blocks:', error);
        setBlocks(blocks);
      }
    }
  };

  const handleMoveBlock = async (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex((b) => b.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = arrayMove(blocks, currentIndex, newIndex);
    setBlocks(newBlocks);

    try {
      await reorderBlocks(newBlocks.map((b) => b.id), selectedPageId);
    } catch (error) {
      console.error('Error reordering blocks:', error);
      setBlocks(blocks);
    }
  };

  const getDefaultContent = (type: BlockType): Record<string, unknown> => {
    switch (type) {
      case BlockType.MAP:
        return { title: '', description: '', addresses: [''] };
      case BlockType.TEXT:
        return { text: '' };
      case BlockType.LINK:
        return { title: '', url: '', description: '' };
      case BlockType.AVATAR:
        return { avatarUrl: '', name: '', subtitle: '' };
      case BlockType.QA:
        return { question: '', answer: '' };
      case BlockType.ICON_TEXT:
        return { icon: '', text: '' };
      case BlockType.MESSENGERS:
        return { telegram: '', whatsapp: '', viber: '' };
      case BlockType.SOCIAL_NETWORKS:
        return { instagram: '', facebook: '', twitter: '', linkedin: '', youtube: '', vk: '' };
      case BlockType.DIVIDER:
        return { style: 'solid' };
      case BlockType.CUSTOM:
        return { html: '' };
      case BlockType.EVENT_DATE_TIME:
        return { startDate: '', startTime: '', endDate: '', endTime: '', timezone: '' };
      case BlockType.EVENT_LOCATION:
        return { address: '', description: '' };
      case BlockType.EVENT_REGISTRATION:
        return { buttonText: 'Зарегистрироваться', url: '', description: '' };
      case BlockType.EVENT_SCHEDULE:
        return { scheduleItems: [] };
      case BlockType.EVENT_SPEAKERS:
        return { speakers: [] };
      case BlockType.EVENT_PRICE:
        return { tickets: [] };
      case BlockType.EVENT_GALLERY:
        return { images: [] };
      case BlockType.IMAGE_CAROUSEL:
        return { images: [], title: '', autoplay: true, autoplayInterval: 3000 };
      case BlockType.DATE_TIME:
        return { title: '', startDate: '', startTime: '', endDate: '', endTime: '', timezone: '', repeat: 'none' };
      default:
        return {};
    }
  };

  const handleAddBlock = async (type: BlockType) => {
    try {
      const newBlock = await createBlock({
        type,
        content: getDefaultContent(type),
        pageId: selectedPageId || undefined,
      });
      setBlocks([...blocks, newBlock]);
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const handleUpdatePage = async (id: string, data: UpdatePageDto) => {
    const updatedPage = await updatePage(id, data);
    setPages(pages.map((p) => (p.id === id ? updatedPage : p)));
    if (selectedPageId === id) {
      // Перезагружаем блоки если обновился slug
      loadBlocks(id);
    }
  };

  const handleDeletePage = async (id: string) => {
    await deletePage(id);
    setPages(pages.filter((p) => p.id !== id));
    if (selectedPageId === id) {
      const remainingPages = pages.filter((p) => p.id !== id);
      if (remainingPages.length > 0) {
        const mainPage = remainingPages.find(p => p.slug === null) || remainingPages[0];
        setSelectedPageId(mainPage.id);
      } else {
        setSelectedPageId(null);
        setBlocks([]);
      }
    }
  };


  const buildPageUrl = useCallback(
    (page: Page) => {
      if (!page) return '';
      const baseUrl = host ? host.replace(/\/$/, '') : window.location.origin;
      if (page.slug) {
        return `${baseUrl}/${page.slug}`;
      }
      // Для главной страницы (slug = null) используем username
      if (profile?.username) {
        return buildPublicUrl(profile.username);
      }
      return '';
    },
    [host, profile?.username, buildPublicUrl],
  );

  const handleEditBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      setEditingBlockId(blockId);
      setEditingContent(block.content);
    }
  };

  const handleSaveBlock = async (blockId: string) => {
    try {
      const updatedBlock = await updateBlock(blockId, {
        content: editingContent,
      });
      setBlocks(blocks.map((b) => (b.id === blockId ? updatedBlock : b)));
      setEditingBlockId(null);
      setEditingContent({});
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
    setEditingContent({});
  };

  const handleDeleteBlock = async (blockId: string) => {
    setConfirmDeleteBlock({ isOpen: true, blockId });
  };

  const confirmDeleteBlockAction = async () => {
    if (confirmDeleteBlock) {
      try {
        await deleteBlock(confirmDeleteBlock.blockId);
        setBlocks(blocks.filter((b) => b.id !== confirmDeleteBlock.blockId));
        setConfirmDeleteBlock(null);
      } catch (error) {
        console.error('Error deleting block:', error);
        setToast({ message: 'Ошибка при удалении блока', type: 'error' });
        setConfirmDeleteBlock(null);
      }
    }
  };

  const settingsModalKey = `${pageSettings.username}-${showSettingsModal}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md space-y-6">
          <div className="relative">
            <div className="absolute inset-x-1/2 -translate-x-1/2 -top-3 w-24 h-1 bg-white/50 rounded-full" />
            <div className="bg-gradient-to-b from-[#2a0f25] to-[#7b1334] rounded-[40px] shadow-2xl px-6 py-10 min-h-[640px]">
              <div className="space-y-4">
                {blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    type={block.type}
                    content={block.content}
                    isEditing={false}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Eye size={20} />
              Вернуться к редактированию
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  return (
    <div className="min-h-screen bg-[#05070f] text-white pb-32">
      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">BioHub</p>
          <h1 className="text-2xl font-semibold">Редактор страницы</h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          Выйти
        </button>
      </header>

      {/* Header with Create Button */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold">Страницы</h2>
          <button
            onClick={async () => {
              try {
                const newPage = await createPage({
                  title: 'Новая страница',
                  description: null,
                });
                setPages([...pages, newPage]);
                setSelectedPageId(newPage.id);
                setIsEditingMode(true);
                loadBlocks(newPage.id);
              } catch (error) {
                console.error('Error creating page:', error);
                setToast({ message: 'Ошибка при создании страницы. Попробуйте еще раз.', type: 'error' });
              }
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Создать страницу
          </button>
        </div>
      </div>

      <main className="w-full flex justify-center px-6">
        <div className="max-w-6xl w-full">
          {isEditingMode && selectedPageId ? (
            <div className="flex justify-center">
              <div className="max-w-md w-full relative">
                {isEditingMode && (
                  <div className="absolute inset-x-1/2 -translate-x-1/2 -top-3 w-24 h-1 bg-white/30 rounded-full" />
                )}
                <div className="bg-gradient-to-b from-[#2a0f25] to-[#7b1334] rounded-[40px] shadow-2xl px-6 py-10 min-h-[640px]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                      {selectedPage ? selectedPage.title : 'Редактирование'}
                    </h2>
                    <button
                      onClick={() => {
                        setIsEditingMode(false);
                        setSelectedPageId(null);
                      }}
                      className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      Назад к списку
                    </button>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={blocks.map((b) => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {blocks.length === 0 ? (
                          <div className="text-center py-12 text-white/60">
                            Нет блоков. Нажмите «Добавить блок», чтобы начать.
                          </div>
                        ) : (
                          blocks.map((block, index) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              isEditing={editingBlockId === block.id}
                              onEdit={() => handleEditBlock(block.id)}
                              onSave={() => handleSaveBlock(block.id)}
                              onCancel={handleCancelEdit}
                              onDelete={() => handleDeleteBlock(block.id)}
                              onContentChange={setEditingContent}
                              editingContent={editingContent}
                              onMoveUp={() => handleMoveBlock(block.id, 'up')}
                              onMoveDown={() => handleMoveBlock(block.id, 'down')}
                              canMoveUp={index > 0}
                              canMoveDown={index < blocks.length - 1}
                              isMobile={isMobile}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
          ) : (
            <PagesList
              pages={pages}
              onEditPage={(id) => {
                setSelectedPageId(id);
                setIsEditingMode(true);
                loadBlocks(id);
              }}
              onEditPageSettings={(id) => {
                setSelectedPageId(id);
                setShowPageSettingsModal(true);
              }}
              onDeletePage={handleDeletePage}
              onViewPage={(page) => {
                window.open(buildPageUrl(page), '_blank');
              }}
              username={profile?.username || null}
            />
          )}
        </div>
      </main>

      {isEditingMode && selectedPageId && (
        <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 shadow-2xl">
          <button
            onClick={() => setIsPreviewMode(true)}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
            title="Предпросмотр"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => setShowAddBlockModal(true)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white text-sm md:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Добавить блок
          </button>
          <button
            onClick={() => setShowPageSettingsModal(true)}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
            title="Настройки страницы"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      )}

      <AddBlockModal
        isOpen={showAddBlockModal}
        onClose={() => setShowAddBlockModal(false)}
        onSelectBlock={handleAddBlock}
        isEvent={false}
      />
      <ProfileSettingsModal
        key={settingsModalKey}
        isOpen={showSettingsModal}
        initialSettings={pageSettings}
        publicUrl={buildPublicUrl(pageSettings.username)}
        usernameStatus={usernameStatus}
        usernameMessage={usernameMessage}
        onUsernameChange={handleUsernameChange}
        onClose={handleCloseSettings}
        onSave={handleSavePageSettings}
        isSaving={isSavingSettings}
      />
      <PageSettingsModal
        isOpen={showPageSettingsModal}
        page={selectedPage || null}
        publicUrl={selectedPage ? buildPageUrl(selectedPage) : ''}
        onClose={() => setShowPageSettingsModal(false)}
        onSave={handleUpdatePage}
        isSaving={isSavingSettings}
      />

      <ConfirmModal
        isOpen={confirmDeleteBlock?.isOpen || false}
        title="Удалить блок?"
        message="Вы уверены, что хотите удалить этот блок? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={confirmDeleteBlockAction}
        onCancel={() => setConfirmDeleteBlock(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

