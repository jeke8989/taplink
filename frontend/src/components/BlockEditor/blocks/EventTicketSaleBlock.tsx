import React, { useState } from 'react';
import { Ticket, Plus, Minus, X, Info } from 'lucide-react';
import { Toast, type ToastType } from '../../Toast';
import { ConsentCheckbox } from '../../ConsentCheckbox';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface CustomField {
  label: string;
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'email' | 'tel';
}

interface EventTicketSaleBlockProps {
  content: {
    // Основные настройки
    ticketName?: string;
    description?: string;
    price?: number;
    currency?: string;
    buttonText?: string;
    robokassaUrl?: string;
    
    // Ограничения
    minTickets?: number | null;
    maxTickets?: number | null;
    showRemaining?: boolean;
    remainingTickets?: number | null;
    
    // Даты продаж
    saleStartDate?: string | null;
    saleEndDate?: string | null;
    
    // Дополнительные поля
    customFields?: CustomField[];
    
    // Промокод
    enablePromoCode?: boolean;
    
    // Политика конфиденциальности
    privacyPolicyUrl?: string;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventTicketSaleBlock: React.FC<EventTicketSaleBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Основные настройки
  const ticketName = content.ticketName || '';
  const description = content.description || '';
  const price = content.price || 0;
  const currency = content.currency || 'RUB';
  const buttonText = content.buttonText || 'Купить билеты';
  const robokassaUrl = content.robokassaUrl || '';
  
  // Ограничения
  const minTickets = content.minTickets || null;
  const maxTickets = content.maxTickets || null;
  const showRemaining = content.showRemaining ?? false;
  const remainingTickets = content.remainingTickets || null;
  
  // Даты продаж
  const saleStartDate = content.saleStartDate || null;
  const saleEndDate = content.saleEndDate || null;
  
  // Дополнительные поля
  const customFields = content.customFields || [];
  
  // Промокод
  const enablePromoCode = content.enablePromoCode ?? false;
  
  // Политика конфиденциальности
  const privacyPolicyUrl = content.privacyPolicyUrl || '';

  const formatPrice = (amount: number, curr: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
    };
    return `${symbols[curr] || curr} ${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPrice = price * quantity;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;
    if (minTickets != null && newQuantity < minTickets) return;
    if (maxTickets != null && newQuantity > maxTickets) return;
    if (remainingTickets != null && newQuantity > remainingTickets) return;
    setQuantity(newQuantity);
  };

  // Проверка доступности продаж по датам
  const isSaleActive = () => {
    const now = new Date();
    if (saleStartDate && new Date(saleStartDate) > now) return false;
    if (saleEndDate && new Date(saleEndDate) < now) return false;
    return true;
  };

  // Проверка доступности билетов
  const isTicketsAvailable = () => {
    if (remainingTickets != null && remainingTickets <= 0) return false;
    if (maxTickets != null && (remainingTickets || maxTickets) <= 0) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Некорректный телефон';
    }

    if (!consentGiven) {
      newErrors.consent = 'Необходимо дать согласие на обработку персональных данных';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!robokassaUrl) {
      setToast({ message: 'URL Робокассы не настроен. Пожалуйста, настройте блок в редакторе.', type: 'warning' });
      return;
    }

    // Редирект на страницу оплаты Робокассы
    // В будущем здесь можно добавить передачу параметров (количество, данные покупателя)
    window.location.href = robokassaUrl;
  };

  if (isEditing) {
    const handleCustomFieldChange = (index: number, field: keyof CustomField, value: string | boolean) => {
      const updated = [...customFields];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.({ ...content, customFields: updated });
    };

    const handleAddCustomField = () => {
      onChange?.({ 
        ...content, 
        customFields: [...customFields, { label: '', required: false, type: 'text' }] 
      });
    };

    const handleRemoveCustomField = (index: number) => {
      const updated = customFields.filter((_, i) => i !== index);
      onChange?.({ ...content, customFields: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Ticket size={16} />
          <span>Продажа билетов</span>
        </div>

        {/* Основная информация */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Основная информация</h3>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Название билета (опционально)</label>
            <input
              type="text"
              value={ticketName}
              onChange={(e) => onChange?.({ ...content, ticketName: e.target.value })}
              placeholder="Например: Стандартный билет"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Описание билета (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => onChange?.({ ...content, description: e.target.value })}
              placeholder="Что входит в билет"
              className={`${inputClass} resize-none`}
              rows={3}
            />
          </div>
        </div>

        {/* Цена */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Цена</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Цена билета</label>
              <input
                type="number"
                value={price}
                onChange={(e) => onChange?.({ ...content, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={inputClass}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Валюта</label>
              <select
                value={currency}
                onChange={(e) => onChange?.({ ...content, currency: e.target.value })}
                className={inputClass}
              >
                <option value="RUB">₽ RUB</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ограничения */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Ограничения</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Минимальное количество (опционально)</label>
              <input
                type="number"
                value={minTickets || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange?.({ ...content, minTickets: value === '' ? null : parseInt(value, 10) || null });
                }}
                placeholder="Без ограничений"
                className={inputClass}
                min="1"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Максимальное количество (опционально)</label>
              <input
                type="number"
                value={maxTickets || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange?.({ ...content, maxTickets: value === '' ? null : parseInt(value, 10) || null });
                }}
                placeholder="Без ограничений"
                className={inputClass}
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Оставшееся количество билетов (опционально)</label>
              <input
                type="number"
                value={remainingTickets || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange?.({ ...content, remainingTickets: value === '' ? null : parseInt(value, 10) || null });
                }}
                placeholder="Не указано"
                className={inputClass}
                min="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRemaining}
                  onChange={(e) => onChange?.({ ...content, showRemaining: e.target.checked })}
                  className="rounded"
                />
                Показывать количество оставшихся
              </label>
            </div>
          </div>
        </div>

        {/* Даты продаж */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Период продаж</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Дата начала продаж (опционально)</label>
              <input
                type="datetime-local"
                value={saleStartDate || ''}
                onChange={(e) => onChange?.({ ...content, saleStartDate: e.target.value || null })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Дата окончания продаж (опционально)</label>
              <input
                type="datetime-local"
                value={saleEndDate || ''}
                onChange={(e) => onChange?.({ ...content, saleEndDate: e.target.value || null })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Дополнительные поля формы */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">Дополнительные поля формы</h3>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200"
            >
              <Plus size={14} />
              Добавить поле
            </button>
          </div>
          {customFields.map((field, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Поле {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Название поля</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                  placeholder="Например: Комментарий"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Тип поля</label>
                  <select
                    value={field.type}
                    onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                    className={inputClass}
                  >
                    <option value="text">Текст</option>
                    <option value="textarea">Многострочный текст</option>
                    <option value="number">Число</option>
                    <option value="email">Email</option>
                    <option value="tel">Телефон</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleCustomFieldChange(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    Обязательное
                  </label>
                </div>
              </div>
            </div>
          ))}
          {customFields.length === 0 && (
            <p className="text-xs text-white/40 text-center py-2">
              Дополнительные поля не добавлены
            </p>
          )}
        </div>

        {/* Промокод */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Промокод</h3>
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={enablePromoCode}
              onChange={(e) => onChange?.({ ...content, enablePromoCode: e.target.checked })}
              className="rounded"
            />
            Включить поле для промокода
          </label>
        </div>

        {/* Настройки кнопки и оплаты */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Настройки оплаты</h3>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Текст кнопки</label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => onChange?.({ ...content, buttonText: e.target.value })}
              placeholder="Купить билеты"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">URL Робокассы</label>
            <input
              type="url"
              value={robokassaUrl}
              onChange={(e) => onChange?.({ ...content, robokassaUrl: e.target.value })}
              placeholder="https://auth.robokassa.ru/Merchant/Index.aspx"
              className={inputClass}
            />
            <p className="text-xs text-white/40 mt-1">URL страницы оплаты Робокассы</p>
          </div>
        </div>

        {/* Политика конфиденциальности */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Политика конфиденциальности</h3>
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
      </div>
    );
  }

  // Проверка доступности продаж
  const saleActive = isSaleActive();
  const ticketsAvailable = isTicketsAvailable();
  const canPurchase = saleActive && ticketsAvailable;

  // Вычисление доступного максимума
  const getMaxAvailable = () => {
    if (remainingTickets != null) return remainingTickets;
    if (maxTickets != null) return maxTickets;
    return null;
  };

  const maxAvailable = getMaxAvailable();
  const effectiveMin = minTickets || 1;

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Ticket size={20} />
        <span>{ticketName || 'Продажа билетов'}</span>
      </div>

      {description && (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-sm text-white/80">{description}</p>
        </div>
      )}

      {/* Информация о доступности */}
      {!saleActive && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-center gap-2">
          <Info size={16} />
          <span className="text-sm">
            {saleStartDate && new Date(saleStartDate) > new Date() 
              ? `Продажи начнутся ${new Date(saleStartDate).toLocaleString('ru-RU')}`
              : 'Продажи завершены'}
          </span>
        </div>
      )}

      {!ticketsAvailable && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
          <Info size={16} />
          <span className="text-sm">Билеты закончились</span>
        </div>
      )}

      {showRemaining && remainingTickets != null && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
          <span className="text-sm">Осталось билетов: <strong>{remainingTickets}</strong></span>
        </div>
      )}

      {price > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm text-white/70 mb-2">Цена за билет</div>
          <div className="text-2xl font-bold">{formatPrice(price, currency)}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-white/70 mb-2 block">
            Количество билетов
            {minTickets && minTickets > 1 && (
              <span className="text-white/50 ml-2">(минимум: {minTickets})</span>
            )}
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= effectiveMin || !canPurchase}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="text-xl font-semibold min-w-[3rem] text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={(maxAvailable != null && quantity >= maxAvailable) || !canPurchase}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={18} />
            </button>
            {maxAvailable != null && (
              <span className="text-sm text-white/60 ml-auto">
                Максимум: {maxAvailable}
              </span>
            )}
          </div>
        </div>

        {totalPrice > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Итого</span>
              <span className="text-xl font-bold">{formatPrice(totalPrice, currency)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-white/70 mb-2 block">
            Имя <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Введите ваше имя"
            className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`}
            required
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="example@email.com"
            className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
            required
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block">
            Телефон <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            placeholder="+7 (999) 123-45-67"
            className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`}
            required
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>

        {/* Промокод */}
        {enablePromoCode && (
          <div>
            <label className="text-sm text-white/70 mb-2 block">Промокод (опционально)</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Введите промокод"
              className={inputClass}
            />
          </div>
        )}

        {/* Дополнительные поля */}
        {customFields.map((field, index) => (
          <div key={index}>
            <label className="text-sm text-white/70 mb-2 block">
              {field.label || `Поле ${index + 1}`}
              {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={customFieldValues[`field_${index}`] || ''}
                onChange={(e) => {
                  setCustomFieldValues({ ...customFieldValues, [`field_${index}`]: e.target.value });
                }}
                placeholder={`Введите ${field.label.toLowerCase()}`}
                className={`${inputClass} resize-none`}
                rows={3}
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                value={customFieldValues[`field_${index}`] || ''}
                onChange={(e) => {
                  setCustomFieldValues({ ...customFieldValues, [`field_${index}`]: e.target.value });
                }}
                placeholder={`Введите ${field.label.toLowerCase()}`}
                className={inputClass}
                required={field.required}
              />
            )}
          </div>
        ))}

        {/* Согласие на обработку персональных данных */}
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
          disabled={!canPurchase}
          className="w-full bg-white bg-opacity-20 px-6 py-4 rounded-xl text-center font-semibold hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {canPurchase ? buttonText : 'Продажи недоступны'}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

