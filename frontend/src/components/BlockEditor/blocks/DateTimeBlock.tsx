import React, { useState } from 'react';
import { Calendar, Clock, Repeat } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface DateTimeBlockProps {
  content: {
    title?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    timezone?: string;
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    displayStyle?: 'text' | 'countdown' | 'calendar' | 'combined';
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

const TIMEZONES = [
  { value: '', label: 'Локальное время' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
  { value: 'Europe/Minsk', label: 'Минск (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
  { value: 'America/New_York', label: 'Нью-Йорк (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Лос-Анджелес (UTC-8)' },
  { value: 'Europe/London', label: 'Лондон (UTC+0)' },
  { value: 'Asia/Tokyo', label: 'Токио (UTC+9)' },
];

export const DateTimeBlock: React.FC<DateTimeBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {

  const {
    title = '',
    startDate = '',
    startTime = '',
    endDate = '',
    endTime = '',
    timezone = '',
    repeat = 'none',
  } = content;

  const [hasEndDate, setHasEndDate] = useState(!!endDate);


  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };


  const getRepeatLabel = (repeatType: string) => {
    switch (repeatType) {
      case 'daily':
        return 'Ежедневно';
      case 'weekly':
        return 'Еженедельно';
      case 'monthly':
        return 'Ежемесячно';
      case 'yearly':
        return 'Ежегодно';
      default:
        return 'Не повторяется';
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Calendar size={16} />
          <span>Дата и время</span>
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1 block">Название события (опционально)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange?.({ ...content, title: e.target.value })}
            placeholder="Например: Встреча, День рождения"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Дата начала *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChange?.({ ...content, startDate: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Время начала *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onChange?.({ ...content, startTime: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasEndDate"
            checked={hasEndDate}
            onChange={(e) => {
              setHasEndDate(e.target.checked);
              if (!e.target.checked) {
                onChange?.({ ...content, endDate: '', endTime: '' });
              }
            }}
            className="rounded"
          />
          <label htmlFor="hasEndDate" className="text-sm text-white/70">
            Указать дату и время окончания
          </label>
        </div>

        {hasEndDate && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Дата окончания</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onChange?.({ ...content, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Время окончания</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onChange?.({ ...content, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-white/60 mb-1 block">Часовой пояс (опционально)</label>
          <select
            value={timezone}
            onChange={(e) => onChange?.({ ...content, timezone: e.target.value })}
            className={inputClass}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1 block">Повторение</label>
          <select
            value={repeat}
            onChange={(e) =>
              onChange?.({ ...content, repeat: e.target.value as typeof repeat })
            }
            className={inputClass}
          >
            <option value="none">Не повторяется</option>
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
            <option value="yearly">Ежегодно</option>
          </select>
        </div>

      </div>
    );
  }

  // Режим просмотра
  if (!startDate || !startTime) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 text-center text-white/60 border border-white/10">
        <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
          <Calendar size={32} className="text-white/40" />
        </div>
        <p className="text-white/70">Дата и время не указаны</p>
      </div>
    );
  }

  const renderCalendarStyle = () => {
    const day = new Date(startDate).getDate();
    const month = new Date(startDate).toLocaleDateString('ru-RU', { month: 'long' });
    const year = new Date(startDate).getFullYear();
    
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 text-white space-y-4 border border-white/10 shadow-lg">
        {title && (
          <div className="flex items-center gap-3 text-lg font-bold">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar size={20} className="text-blue-400" />
            </div>
            <span>{title}</span>
          </div>
        )}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl border border-blue-400/30 min-w-[80px]">
            <div className="text-5xl font-bold text-white leading-none">{day}</div>
            <div className="text-xs text-white/80 uppercase tracking-wider mt-1">
              {new Date(startDate).toLocaleDateString('ru-RU', { month: 'short' })}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg mb-2">
              {month} {year} г.
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Clock size={16} className="text-white/60" />
              <span className="font-medium">Начало: {formatTime(startTime)}</span>
            </div>
            {endDate && (
              <div className="text-sm text-white/70 mt-2">
                До: {formatDate(endDate)} {endTime && formatTime(endTime)}
              </div>
            )}
          </div>
        </div>
        {repeat !== 'none' && (
          <div className="flex items-center gap-2 text-sm text-white/70 pt-3 border-t border-white/10">
            <Repeat size={14} className="text-white/60" />
            <span>{getRepeatLabel(repeat)}</span>
          </div>
        )}
      </div>
    );
  };

  // Всегда используем календарный стиль
  return renderCalendarStyle();
};

