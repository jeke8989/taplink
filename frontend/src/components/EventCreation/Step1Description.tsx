import React from 'react';
import type { EventDescriptionSettings } from './types';

const inputClass =
  'w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

interface Step1DescriptionProps {
  value: EventDescriptionSettings;
  onChange: (value: EventDescriptionSettings) => void;
}

export const Step1Description: React.FC<Step1DescriptionProps> = ({
  value,
  onChange,
}) => {
  const handleTitleChange = (title: string) => {
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    onChange({
      ...value,
      title,
      slug: value.slug || autoSlug,
    });
  };

  const handleSlugChange = (slug: string) => {
    const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange({
      ...value,
      slug: normalized,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Шаг 1. Описание
        </h2>
        <p className="text-sm text-gray-500">
          Заполните основную информацию о событии. Эти данные увидят участники
          на странице мероприятия.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название мероприятия *
          </label>
          <input
            type="text"
            value={value.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: Воркшоп по маркетингу"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL (slug) *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              /username/
            </span>
            <input
              type="text"
              value={value.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="event-2025"
              className={inputClass}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Только строчные латинские буквы, цифры и дефисы.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Краткое описание
          </label>
          <textarea
            value={value.description}
            onChange={(e) =>
              onChange({
                ...value,
                description: e.target.value,
              })
            }
            rows={4}
            placeholder="Расскажите, что будет на событии, для кого оно и в каком формате пройдет."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
};


