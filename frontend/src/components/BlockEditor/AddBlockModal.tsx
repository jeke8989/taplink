import React from 'react';
import {
  X,
  Type,
  Link as LinkIcon,
  User,
  Minus,
  MessageCircle,
  List,
  MessageSquare,
  Share2,
  Layers,
  MapPin,
} from 'lucide-react';
import { BlockType } from '../../api/blocks';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
}) => {
  const standardBlocks: BlockOption[] = [
    { type: BlockType.TEXT, icon: <Type size={28} />, label: 'Текст' },
    { type: BlockType.LINK, icon: <LinkIcon size={28} />, label: 'Ссылка' },
    { type: BlockType.CUSTOM, icon: <Layers size={28} />, label: 'Свой блок' },
    { type: BlockType.DIVIDER, icon: <Minus size={28} />, label: 'Разделитель' },
    { type: BlockType.AVATAR, icon: <User size={28} />, label: 'Аватар' },
    { type: BlockType.QA, icon: <MessageCircle size={28} />, label: 'Вопросы и ответы' },
    { type: BlockType.ICON_TEXT, icon: <List size={28} />, label: 'Иконка и текст' },
    { type: BlockType.MESSENGERS, icon: <MessageSquare size={28} />, label: 'Мессенджеры' },
    { type: BlockType.SOCIAL_NETWORKS, icon: <Share2 size={28} />, label: 'Социальные сети' },
    { type: BlockType.MAP, icon: <MapPin size={28} />, label: 'Карта' },
  ];

  if (!isOpen) return null;

  const handleSelectBlock = (type: BlockType) => {
    onSelectBlock(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Новый блок</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {standardBlocks.map((block) => (
              <button
                key={block.type}
                onClick={() => handleSelectBlock(block.type)}
                className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
              >
                <div className="text-gray-400 group-hover:text-blue-400 transition-colors mb-3">
                  {block.icon}
                </div>
                <span className="text-sm text-gray-300 text-center">
                  {block.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

