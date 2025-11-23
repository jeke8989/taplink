import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface EventDateTimeBlockProps {
  content: {
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventDateTimeBlock: React.FC<EventDateTimeBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Calendar size={16} />
          <span>Дата и время мероприятия</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Дата начала</label>
            <input
              type="date"
              value={content.startDate || ''}
              onChange={(e) => onChange?.({ ...content, startDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Время начала</label>
            <input
              type="time"
              value={content.startTime || ''}
              onChange={(e) => onChange?.({ ...content, startTime: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Дата окончания (опционально)</label>
            <input
              type="date"
              value={content.endDate || ''}
              onChange={(e) => onChange?.({ ...content, endDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Время окончания (опционально)</label>
            <input
              type="time"
              value={content.endTime || ''}
              onChange={(e) => onChange?.({ ...content, endTime: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-3">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Calendar size={20} />
        <span>Дата и время</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-white/60" />
          <div>
            <div className="font-medium">
              {formatDate(content.startDate) || 'Дата не указана'}
            </div>
            {content.startTime && (
              <div className="text-sm opacity-80">
                Начало: {formatTime(content.startTime)}
              </div>
            )}
          </div>
        </div>
        {(content.endDate || content.endTime) && (
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Clock size={14} className="text-white/60" />
            <div>
              {content.endDate && formatDate(content.endDate) !== formatDate(content.startDate) && (
                <div>Окончание: {formatDate(content.endDate)}</div>
              )}
              {content.endTime && (
                <div>Время окончания: {formatTime(content.endTime)}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

