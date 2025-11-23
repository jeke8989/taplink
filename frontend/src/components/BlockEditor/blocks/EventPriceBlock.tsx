import React from 'react';
import { DollarSign, Plus, X } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

interface PriceTier {
  name: string;
  price: number;
  currency: string;
  description?: string;
  available: boolean;
}

interface EventPriceBlockProps {
  content: {
    tiers?: PriceTier[];
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

export const EventPriceBlock: React.FC<EventPriceBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  const tiers = content.tiers || [];

  if (isEditing) {
    const handleTierChange = (index: number, field: keyof PriceTier, value: string | number | boolean) => {
      const updated = [...tiers];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.({ ...content, tiers: updated });
    };

    const handleAddTier = () => {
      onChange?.({ ...content, tiers: [...tiers, { name: '', price: 0, currency: 'RUB', description: '', available: true }] });
    };

    const handleRemoveTier = (index: number) => {
      const updated = tiers.filter((_, i) => i !== index);
      onChange?.({ ...content, tiers: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <DollarSign size={16} />
          <span>Цены и билеты</span>
        </div>
        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Тариф {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTier(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Название тарифа</label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                  placeholder="Например: Ранний билет"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Цена</label>
                  <input
                    type="number"
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className={inputClass}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Валюта</label>
                  <select
                    value={tier.currency}
                    onChange={(e) => handleTierChange(index, 'currency', e.target.value)}
                    className={inputClass}
                  >
                    <option value="RUB">₽ RUB</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Описание (опционально)</label>
                <textarea
                  value={tier.description || ''}
                  onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                  placeholder="Что входит в тариф"
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={tier.available}
                  onChange={(e) => handleTierChange(index, 'available', e.target.checked)}
                  className="rounded"
                />
                Доступен для покупки
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddTier}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
        >
          <Plus size={16} />
          Добавить тариф
        </button>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString('ru-RU')}`;
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-white space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <DollarSign size={20} />
        <span>Цены и билеты</span>
      </div>
      {tiers.length === 0 ? (
        <div className="text-center text-white/60 py-4">
          Тарифы не указаны
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white/5 rounded-lg p-4 space-y-2 ${!tier.available ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{tier.name || 'Без названия'}</div>
                {!tier.available && (
                  <span className="text-xs text-red-400">Недоступен</span>
                )}
              </div>
              <div className="text-2xl font-bold">
                {formatPrice(tier.price, tier.currency)}
              </div>
              {tier.description && (
                <div className="text-sm opacity-80">{tier.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

