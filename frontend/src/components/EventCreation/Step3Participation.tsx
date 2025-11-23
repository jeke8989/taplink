import React from 'react';
import type { ParticipationSettings, Ticket, Discount } from './types';
import { Plus, Trash2 } from 'lucide-react';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

interface Step3ParticipationProps {
  value: ParticipationSettings;
  onChange: (value: ParticipationSettings) => void;
}

export const Step3Participation: React.FC<Step3ParticipationProps> = ({
  value,
  onChange,
}) => {
  const handleTicketChange = (id: string, patch: Partial<Ticket>) => {
    const tickets = value.tickets.map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    );
    onChange({ ...value, tickets });
  };

  const handleAddTicket = () => {
    const newTicket: Ticket = {
      id: `t_${Date.now()}`,
      name: 'Новый билет',
      price: 0,
      currency: 'RUB',
      quantity: null,
    };
    onChange({ ...value, tickets: [...value.tickets, newTicket] });
  };

  const handleRemoveTicket = (id: string) => {
    const tickets = value.tickets.filter((t) => t.id !== id);
    onChange({ ...value, tickets });
  };

  const handleDiscountChange = (id: string, patch: Partial<Discount>) => {
    const discounts = value.discounts.map((d) =>
      d.id === id ? { ...d, ...patch } : d,
    );
    onChange({ ...value, discounts });
  };

  const handleAddDiscount = () => {
    const newDiscount: Discount = {
      id: `d_${Date.now()}`,
      name: 'Новая скидка',
      type: 'percent',
      value: 10,
    };
    onChange({ ...value, discounts: [...value.discounts, newDiscount] });
  };

  const handleRemoveDiscount = (id: string) => {
    const discounts = value.discounts.filter((d) => d.id !== id);
    onChange({ ...value, discounts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Шаг 3. Настройка участия
        </h2>
        <p className="text-sm text-gray-500">
          Добавьте билеты и скидки. Эти настройки влияют на то, как участники
          будут регистрироваться и оплачивать участие.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-800">Билеты</h3>
          <div className="space-y-3">
            {value.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) =>
                      handleTicketChange(ticket.id, { name: e.target.value })
                    }
                    className={`${inputClass} max-w-xs`}
                    placeholder="Название билета"
                  />
                  {value.tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTicket(ticket.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Стоимость
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.price}
                      onChange={(e) =>
                        handleTicketChange(ticket.id, {
                          price: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Валюта
                    </label>
                    <select
                      value={ticket.currency}
                      onChange={(e) =>
                        handleTicketChange(ticket.id, {
                          currency: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="RUB">RUB</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Количество в заказе
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={ticket.quantity ?? ''}
                      onChange={(e) =>
                        handleTicketChange(ticket.id, {
                          quantity: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className={inputClass}
                      placeholder="Неограниченно"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddTicket}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Добавить билет
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-800">Скидки</h3>
          <div className="space-y-3">
            {value.discounts.map((discount) => (
              <div
                key={discount.id}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={discount.name}
                    onChange={(e) =>
                      handleDiscountChange(discount.id, {
                        name: e.target.value,
                      })
                    }
                    className={`${inputClass} max-w-xs`}
                    placeholder="Название скидки"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDiscount(discount.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    Удалить
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Тип
                    </label>
                    <select
                      value={discount.type}
                      onChange={(e) =>
                        handleDiscountChange(discount.id, {
                          type: e.target.value as Discount['type'],
                        })
                      }
                      className={inputClass}
                    >
                      <option value="percent">Процент</option>
                      <option value="fixed">Фиксированная сумма</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Значение
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discount.value}
                      onChange={(e) =>
                        handleDiscountChange(discount.id, {
                          value: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddDiscount}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Добавить скидку
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
            <input
              id="summarize-discounts"
              type="checkbox"
              checked={value.summarizeDiscounts}
              onChange={(e) =>
                onChange({ ...value, summarizeDiscounts: e.target.checked })
              }
            />
            <label htmlFor="summarize-discounts">
              Суммировать скидки при нескольких применениях
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};


