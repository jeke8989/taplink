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
} from 'lucide-react';
import type { Block } from '../api/blocks';
import { BlockType, getBlocks, createBlock, updateBlock, deleteBlock, reorderBlocks } from '../api/blocks';
import type { UserProfile } from '../api/profile';
import {
  getMyProfile,
  updateMyProfile,
  checkUsernameAvailability,
} from '../api/profile';
import { AddBlockModal } from '../components/BlockEditor/AddBlockModal';
import { BlockRenderer } from '../components/BlockEditor/BlockRenderer';
import { PageSettingsModal, type UsernameStatus } from '../components/PageSettings/PageSettingsModal';
import type { PageSettings } from '../components/PageSettings/types';
import { defaultPageSettings } from '../components/PageSettings/types';

interface SortableBlockProps {
  block: Block;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onContentChange: (content: Record<string, unknown>) => void;
  editingContent: Record<string, unknown>;
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
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

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
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
        >
          <GripVertical size={20} />
        </button>
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.origin);
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

  const loadBlocks = useCallback(async () => {
    try {
      const data = await getBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setLoading(false);
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
    loadBlocks();
    loadProfile();
  }, [loadBlocks, loadProfile]);
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

    setUsernameStatus('checking');
    setUsernameMessage('Проверяем доступность…');
    const timeout = setTimeout(() => {
      checkUsernameAvailability(candidate)
        .then((available) => {
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
          setUsernameStatus('error');
          setUsernameMessage('Не удалось проверить никнейм');
        });
    }, 500);

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

  const publicUrl = buildPublicUrl(pageSettings.username);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);

      try {
        await reorderBlocks(newBlocks.map((b) => b.id));
      } catch (error) {
        console.error('Error reordering blocks:', error);
        setBlocks(blocks);
      }
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
      default:
        return {};
    }
  };

  const handleAddBlock = async (type: BlockType) => {
    try {
      const newBlock = await createBlock({
        type,
        content: getDefaultContent(type),
      });
      setBlocks([...blocks, newBlock]);
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

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
    if (window.confirm('Удалить этот блок?')) {
      try {
        await deleteBlock(blockId);
        setBlocks(blocks.filter((b) => b.id !== blockId));
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  const settingsModalKey = `${pageSettings.username}-${showSettingsModal}`;

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

      <main className="w-full flex justify-center px-6">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-x-1/2 -translate-x-1/2 -top-3 w-24 h-1 bg-white/30 rounded-full" />
          <div className="bg-gradient-to-b from-[#2a0f25] to-[#7b1334] rounded-[40px] shadow-2xl px-6 py-10 min-h-[640px]">
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
                    blocks.map((block) => (
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
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full flex items-center gap-3 px-5 py-3 shadow-lg">
        <button
          onClick={() => setIsPreviewMode(true)}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Eye size={22} />
        </button>
        <button
          onClick={() => setShowAddBlockModal(true)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold transition-colors"
        >
          Добавить блок
        </button>
        <button
          onClick={() => {
            setShowAddBlockModal(false);
            setShowSettingsModal(true);
          }}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <SettingsIcon size={22} />
        </button>
      </div>

      <AddBlockModal
        isOpen={showAddBlockModal}
        onClose={() => setShowAddBlockModal(false)}
        onSelectBlock={handleAddBlock}
      />
      <PageSettingsModal
        key={settingsModalKey}
        isOpen={showSettingsModal}
        initialSettings={pageSettings}
        publicUrl={publicUrl}
        usernameStatus={usernameStatus}
        usernameMessage={usernameMessage}
        onUsernameChange={handleUsernameChange}
        onClose={handleCloseSettings}
        onSave={handleSavePageSettings}
        isSaving={isSavingSettings}
      />
    </div>
  );
};

