import React from 'react';
import type { PublicationSettings } from './types';

interface Step4PublicationProps {
  value: PublicationSettings;
  onChange: (value: PublicationSettings) => void;
}

export const Step4Publication: React.FC<Step4PublicationProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Шаг 4. Публикация
        </h2>
        <p className="text-sm text-gray-500">
          Выберите, кто увидит событие, и задайте возрастные ограничения.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            Настройки приватности
          </h3>
          <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={value.visibility === 'public'}
                onChange={() =>
                  onChange({ ...value, visibility: 'public' })
                }
              />
              <div>
                <div className="font-medium">Публичное событие</div>
                <div className="text-xs text-gray-500">
                  Событие будет доступно всем по поиску и ссылке.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="visibility"
                value="link"
                checked={value.visibility === 'link'}
                onChange={() =>
                  onChange({ ...value, visibility: 'link' })
                }
              />
              <div>
                <div className="font-medium">По прямой ссылке</div>
                <div className="text-xs text-gray-500">
                  Только пользователи, у которых есть ссылка, смогут открыть
                  страницу.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="visibility"
                value="hidden"
                checked={value.visibility === 'hidden'}
                onChange={() =>
                  onChange({ ...value, visibility: 'hidden' })
                }
              />
              <div>
                <div className="font-medium">Полностью скрытое событие</div>
                <div className="text-xs text-gray-500">
                  Страница будет доступна только администраторам. Участники не
                  увидят событие.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            Возрастные ограничения
          </h3>
          <select
            value={value.ageRestriction}
            onChange={(e) =>
              onChange({ ...value, ageRestriction: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="0+">0+</option>
            <option value="6+">6+</option>
            <option value="12+">12+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Укажите возрастное ограничение в соответствии с законодательством.
          </p>
        </div>
      </section>
    </div>
  );
};


