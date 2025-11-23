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
  Calendar,
  Images,
  MapPin as MapPinIcon,
  UserPlus,
  Clock,
  DollarSign,
  Image,
  Ticket,
} from 'lucide-react';
import { BlockType } from '../../api/blocks';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  isEvent?: boolean;
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
  isEvent = false,
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
    { type: BlockType.IMAGE_CAROUSEL, icon: <Images size={28} />, label: 'Карусель картинок' },
    { type: BlockType.DATE_TIME, icon: <Calendar size={28} />, label: 'Дата и время' },
    { type: BlockType.EVENT_TICKET_SALE, icon: <Ticket size={28} />, label: 'Продажа билетов' },
  ];

  const eventBlocks: BlockOption[] = [
    { type: BlockType.EVENT_DATE_TIME, icon: <Calendar size={28} />, label: 'Дата и время' },
    { type: BlockType.EVENT_LOCATION, icon: <MapPinIcon size={28} />, label: 'Место проведения' },
    { type: BlockType.EVENT_REGISTRATION, icon: <UserPlus size={28} />, label: 'Регистрация' },
    { type: BlockType.EVENT_SCHEDULE, icon: <Clock size={28} />, label: 'Программа' },
    { type: BlockType.EVENT_SPEAKERS, icon: <User size={28} />, label: 'Спикеры' },
    { type: BlockType.EVENT_PRICE, icon: <DollarSign size={28} />, label: 'Цены и билеты' },
    { type: BlockType.EVENT_GALLERY, icon: <Image size={28} />, label: 'Галерея' },
    { type: BlockType.EVENT_TICKET_SALE, icon: <Ticket size={28} />, label: 'Продажа билетов' },
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
          {isEvent && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Основные блоки</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
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
              <h3 className="text-sm font-semibold text-white/70 mb-3">Блоки для мероприятий</h3>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {(isEvent ? eventBlocks : standardBlocks).map((block) => (
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

