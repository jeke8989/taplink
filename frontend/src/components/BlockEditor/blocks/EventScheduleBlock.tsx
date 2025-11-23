import React from 'react';
import { Clock, Plus, X } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface ScheduleSlot {
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
}

interface EventScheduleBlockProps {
  content: {
    slots?: ScheduleSlot[];
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventScheduleBlock: React.FC<EventScheduleBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const slots = content.slots || [];

  if (isEditing) {
    const handleSlotChange = (index: number, field: keyof ScheduleSlot, value: string) => {
      const updated = [...slots];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.({ ...content, slots: updated });
    };

    const handleAddSlot = () => {
      onChange?.({ ...content, slots: [...slots, { startTime: '', endTime: '', title: '', description: '' }] });
    };

    const handleRemoveSlot = (index: number) => {
      const updated = slots.filter((_, i) => i !== index);
      onChange?.({ ...content, slots: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock size={16} />
          <span>Программа мероприятия</span>
        </div>
        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Слот {index + 1}</span>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Время начала</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Время окончания</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Название</label>
                <input
                  type="text"
                  value={slot.title}
                  onChange={(e) => handleSlotChange(index, 'title', e.target.value)}
                  placeholder="Название события"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Описание (опционально)</label>
                <textarea
                  value={slot.description || ''}
                  onChange={(e) => handleSlotChange(index, 'description', e.target.value)}
                  placeholder="Описание события"
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddSlot}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
        >
          <Plus size={16} />
          Добавить событие
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Clock size={20} />
        <span>Программа</span>
      </div>
      {slots.length === 0 ? (
        <div className="text-center text-white/60 py-4">
          Программа не указана
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={index} className="border-l-2 border-white/20 pl-4 py-2">
              <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                <Clock size={14} />
                <span>
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
              <div className="font-semibold">{slot.title || 'Без названия'}</div>
              {slot.description && (
                <div className="text-sm opacity-80 mt-1">{slot.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

