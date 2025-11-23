import React from 'react';
import type { RegistrationSettings, RegistrationQuestion } from './types';
import { Plus, Trash2 } from 'lucide-react';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

interface Step2RegistrationProps {
  value: RegistrationSettings;
  onChange: (value: RegistrationSettings) => void;
}

export const Step2Registration: React.FC<Step2RegistrationProps> = ({
  value,
  onChange,
}) => {
  const handleQuestionChange = (
    id: string,
    patch: Partial<RegistrationQuestion>,
  ) => {
    const questions = value.questions.map((q) =>
      q.id === id ? { ...q, ...patch } : q,
    );
    onChange({ ...value, questions });
  };

  const handleAddQuestion = () => {
    const newQuestion: RegistrationQuestion = {
      id: `q_${Date.now()}`,
      label: 'Новый вопрос',
      required: false,
      type: 'short_text',
    };
    onChange({ ...value, questions: [...value.questions, newQuestion] });
  };

  const handleRemoveQuestion = (id: string) => {
    const questions = value.questions.filter((q) => q.id !== id);
    onChange({ ...value, questions });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Шаг 2. Анкета регистрации
        </h2>
        <p className="text-sm text-gray-500">
          Настройте вопросы, на которые участники ответят при регистрации.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст перед анкетой
          </label>
          <textarea
            value={value.introText}
            onChange={(e) =>
              onChange({ ...value, introText: e.target.value })
            }
            rows={3}
            placeholder="Например: заполните, пожалуйста, контактные данные, чтобы мы могли прислать вам материалы после события."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-800">Вопросы анкеты</h3>
          <div className="space-y-3">
            {value.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    Вопрос {index + 1}
                  </span>
                  {index > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={question.label}
                  onChange={(e) =>
                    handleQuestionChange(question.id, {
                      label: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Текст вопроса"
                />
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        handleQuestionChange(question.id, {
                          required: e.target.checked,
                        })
                      }
                    />
                    Обязательный
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Тип ответа:</span>
                    <select
                      value={question.type}
                      onChange={(e) =>
                        handleQuestionChange(question.id, {
                          type: e.target.value as RegistrationQuestion['type'],
                        })
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="short_text">Короткий ответ</option>
                      <option value="long_text">Длинный ответ</option>
                      <option value="single_choice">Выбор одного варианта</option>
                      <option value="multiple_choice">
                        Выбор нескольких вариантов
                      </option>
                      <option value="file">Файл</option>
                      <option value="phone">Номер телефона</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Добавить вопрос
          </button>
        </div>
      </div>
    </div>
  );
};


