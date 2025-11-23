import React, { useState } from 'react';
import { 
  Calendar, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import type { Event } from '../api/events';
import { ConfirmModal } from './ConfirmModal';

interface EventsListProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  onEditEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEvent: (event: Event) => void;
  username: string | null;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEvent,
  username,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; eventId: string; eventTitle: string } | null>(null);

  const formatDate = (date: Date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${dayNum} ${month} ${year}`;
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          Нет мероприятий. Создайте первое мероприятие.
        </div>
      ) : (
        events.map((event) => {
          // Используем дату создания как дату события (пока нет отдельного поля)
          const eventDate = new Date(event.createdAt);
          const daysUntil = getDaysUntil(eventDate);
          const isSelected = selectedEventId === event.id;
          const formattedDate = formatDate(eventDate);
          const startTime = eventDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          const endTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          const daysText = daysUntil > 0 
            ? `через ${daysUntil} ${daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}`
            : daysUntil === 0 
            ? 'сегодня' 
            : 'прошло';

          return (
            <div
              key={event.id}
              className={`bg-white/5 rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-400 bg-white/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>Опубликовано</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === event.id ? null : event.id);
                      }}
                      className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpenId === event.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                          }}
                        />
                        <div className="absolute right-0 top-10 z-20 bg-gray-800 border border-white/20 rounded-lg shadow-xl min-w-[160px] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(event.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                          >
                            <Edit2 size={16} />
                            Настройки
                          </button>
                          {username && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewEvent(event);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                            >
                              <ExternalLink size={16} />
                              Открыть
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({ isOpen: true, eventId: event.id, eventTitle: event.title });
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Удалить
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">{event.title}</h3>

                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Calendar size={16} className="text-white/50" />
                      <span>
                        {formattedDate}, {startTime} – {endTime} {daysText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <ArrowUpRight size={16} className="text-white/50" />
                      <span>По ссылке</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin size={16} className="text-white/50" />
                      <span>Не указано</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Доход</span>
                      <span className="text-white font-medium">0 ₽</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Заказы</span>
                      <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Билеты</span>
                      <span className="text-white font-medium">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      <ConfirmModal
        isOpen={confirmDelete?.isOpen || false}
        title="Удалить мероприятие?"
        message={`Вы уверены, что хотите удалить мероприятие "${confirmDelete?.eventTitle}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={() => {
          if (confirmDelete) {
            onDeleteEvent(confirmDelete.eventId);
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

