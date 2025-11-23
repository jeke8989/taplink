import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Description } from './Step1Description';
import { Step2Registration } from './Step2Registration';
import { Step3Participation } from './Step3Participation';
import { Step4Publication } from './Step4Publication';
import type {
  EventCreationState,
  RegistrationQuestion,
  Ticket,
  Discount,
} from './types';
import { createEvent } from '../../api/events';

const steps = [
  'Описание',
  'Анкета регистрации',
  'Настройка участия',
  'Публикация',
] as const;

export const EventCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<EventCreationState>(() => {
    const defaultQuestions: RegistrationQuestion[] = [
      {
        id: 'email',
        label: 'E-mail',
        required: true,
        type: 'short_text',
      },
      {
        id: 'lastName',
        label: 'Фамилия',
        required: true,
        type: 'short_text',
      },
      {
        id: 'firstName',
        label: 'Имя',
        required: true,
        type: 'short_text',
      },
    ];

    const defaultTicket: Ticket = {
      id: 'main',
      name: 'Входной билет',
      price: 0,
      currency: 'RUB',
      quantity: null,
    };

    const defaultDiscounts: Discount[] = [];

    return {
      description: {
        title: '',
        slug: '',
        description: '',
      },
      registration: {
        introText: '',
        questions: defaultQuestions,
      },
      participation: {
        tickets: [defaultTicket],
        discounts: defaultDiscounts,
        summarizeDiscounts: true,
      },
      publication: {
        visibility: 'public',
        ageRestriction: '16+',
      },
    };
  });

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentStep(index);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    navigate('/editor');
  };

  const handleSubmit = async () => {
    setError(null);

    if (!state.description.title.trim()) {
      setError('Укажите название мероприятия на шаге «Описание».');
      setCurrentStep(0);
      return;
    }

    if (!state.description.slug.trim()) {
      setError('Укажите URL (slug) на шаге «Описание».');
      setCurrentStep(0);
      return;
    }

    try {
      setSaving(true);
      await createEvent({
        title: state.description.title.trim(),
        slug: state.description.slug.trim(),
        description: state.description.description.trim() || undefined,
        registrationForm: state.registration,
        tickets: state.participation.tickets,
        discounts: state.participation.discounts,
        publicationSettings: state.publication,
      });
      navigate('/editor');
    } catch (e) {
      console.error('Error creating event', e);
      const message =
        e &&
        typeof e === 'object' &&
        'response' in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      setError(
        (message as string | undefined) ||
          'Не удалось создать мероприятие. Попробуйте ещё раз.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
          Новое событие
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Заполните информацию по шагам, чтобы красиво оформить страницу
          мероприятия.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Steps navigation */}
          <aside className="md:w-64">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <nav className="space-y-2">
                {steps.map((label, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isCompleted
                          ? 'text-gray-800 hover:bg-gray-50'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Step content */}
          <main className="flex-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {currentStep === 0 && (
                <Step1Description
                  value={state.description}
                  onChange={(description) =>
                    setState((prev) => ({ ...prev, description }))
                  }
                />
              )}
              {currentStep === 1 && (
                <Step2Registration
                  value={state.registration}
                  onChange={(registration) =>
                    setState((prev) => ({ ...prev, registration }))
                  }
                />
              )}
              {currentStep === 2 && (
                <Step3Participation
                  value={state.participation}
                  onChange={(participation) =>
                    setState((prev) => ({ ...prev, participation }))
                  }
                />
              )}
              {currentStep === 3 && (
                <Step4Publication
                  value={state.publication}
                  onChange={(publication) =>
                    setState((prev) => ({ ...prev, publication }))
                  }
                />
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Отменить
                  </button>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Назад
                    </button>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Продолжить
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Создание...' : 'Создать событие'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};


