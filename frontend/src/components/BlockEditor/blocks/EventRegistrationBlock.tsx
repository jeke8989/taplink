import React, { useState } from 'react';
import { UserPlus, ExternalLink } from 'lucide-react';
import { ConsentCheckbox } from '../../ConsentCheckbox';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface EventRegistrationBlockProps {
  content: {
    type?: 'button' | 'form';
    url?: string;
    buttonText?: string;
    formFields?: Array<{ label: string; required: boolean }>;
    privacyPolicyUrl?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventRegistrationBlock: React.FC<EventRegistrationBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const privacyPolicyUrl = content.privacyPolicyUrl || '';

  if (isEditing) {
    const type = content.type || 'button';
    const formFields = content.formFields || [{ label: 'Имя', required: true }, { label: 'Email', required: true }];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <UserPlus size={16} />
          <span>Регистрация</span>
        </div>
        <div>
          <label className="text-xs text-white/60 mb-1 block">Тип регистрации</label>
          <select
            value={type}
            onChange={(e) => onChange?.({ ...content, type: e.target.value })}
            className={inputClass}
          >
            <option value="button">Кнопка со ссылкой</option>
            <option value="form">Встроенная форма</option>
          </select>
        </div>
        {type === 'button' ? (
          <>
            <div>
              <label className="text-xs text-white/60 mb-1 block">URL регистрации</label>
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => onChange?.({ ...content, url: e.target.value })}
                placeholder="https://example.com/register"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Текст кнопки</label>
              <input
                type="text"
                value={content.buttonText || 'Зарегистрироваться'}
                onChange={(e) => onChange?.({ ...content, buttonText: e.target.value })}
                placeholder="Зарегистрироваться"
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-xs text-white/60 block">Поля формы</label>
            {formFields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...formFields];
                    updated[index].label = e.target.value;
                    onChange?.({ ...content, formFields: updated });
                  }}
                  placeholder="Название поля"
                  className={`${inputClass} flex-1`}
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => {
                      const updated = [...formFields];
                      updated[index].required = e.target.checked;
                      onChange?.({ ...content, formFields: updated });
                    }}
                    className="rounded"
                  />
                  Обязательное
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange?.({ ...content, formFields: [...formFields, { label: '', required: false }] })}
              className="text-sm text-blue-300 hover:text-blue-200"
            >
              + Добавить поле
            </button>
          </div>
        )}
        <div>
          <label className="text-xs text-white/60 mb-1 block">URL политики конфиденциальности (опционально)</label>
          <input
            type="url"
            value={privacyPolicyUrl}
            onChange={(e) => onChange?.({ ...content, privacyPolicyUrl: e.target.value })}
            placeholder="https://example.com/privacy-policy"
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Если указан, в чекбоксе согласия будет ссылка на политику конфиденциальности
          </p>
        </div>
      </div>
    );
  }

  const type = content.type || 'button';

  if (type === 'button') {
    return (
      <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <UserPlus size={20} />
          <span>Регистрация</span>
        </div>
        {content.url ? (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white bg-opacity-20 px-6 py-4 rounded-xl text-center font-semibold hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {content.buttonText || 'Зарегистрироваться'}
            <ExternalLink size={18} />
          </a>
        ) : (
          <div className="text-center text-white/60 py-4">
            URL регистрации не указан
          </div>
        )}
      </div>
    );
  }

  // Форма регистрации
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!consentGiven) {
      newErrors.consent = 'Необходимо дать согласие на обработку персональных данных';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Здесь можно добавить логику отправки формы
    console.log('Form submitted with consent');
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <UserPlus size={20} />
        <span>Регистрация</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {(content.formFields || []).map((field, index) => (
          <div key={index}>
            <label className="text-sm text-white/70 mb-1 block">
              {field.label || `Поле ${index + 1}`}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.label.toLowerCase().includes('email') ? 'email' : 'text'}
              required={field.required}
              className={inputClass}
              placeholder={`Введите ${field.label.toLowerCase()}`}
            />
          </div>
        ))}
        <ConsentCheckbox
          checked={consentGiven}
          onChange={(checked) => {
            setConsentGiven(checked);
            if (errors.consent) setErrors({ ...errors, consent: '' });
          }}
          privacyPolicyUrl={privacyPolicyUrl}
          error={errors.consent}
          required={true}
        />
        <button
          type="submit"
          className="w-full bg-white bg-opacity-20 px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-300"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

