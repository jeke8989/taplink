import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

export type ButtonAnimation = 'pulse' | 'shine' | 'slide' | 'bounce' | 'glow';

interface LinkBlockProps {
  content: {
    title?: string;
    url?: string;
    description?: string;
    animation?: ButtonAnimation;
  };
  isEditing?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
}

const animationOptions: Array<{ value: ButtonAnimation; label: string; description: string }> = [
  { value: 'pulse', label: 'Пульсация', description: 'Постоянное плавное увеличение и уменьшение' },
  { value: 'shine', label: 'Блеск', description: 'Постоянный эффект блеска, движущийся по кнопке' },
  { value: 'slide', label: 'Сдвиг', description: 'Постоянная волна света слева направо' },
  { value: 'bounce', label: 'Подпрыгивание', description: 'Постоянное легкое подпрыгивание' },
  { value: 'glow', label: 'Свечение', description: 'Постоянное пульсирующее свечение границы' },
];

// CSS классы для анимаций (работают постоянно, без наведения)
const getAnimationClasses = (animation: ButtonAnimation = 'pulse'): string => {
  const baseClasses = 'block bg-white bg-opacity-20 px-6 py-4 rounded-xl text-center transition-all duration-300 relative overflow-hidden hover:bg-opacity-30';
  
  switch (animation) {
    case 'pulse':
      return `${baseClasses} animate-pulse-constant hover:scale-105`;
    case 'shine':
      return `${baseClasses} shine-effect-constant`;
    case 'slide':
      return `${baseClasses} slide-effect-constant`;
    case 'bounce':
      return `${baseClasses} animate-bounce-constant hover:-translate-y-1 hover:shadow-lg`;
    case 'glow':
      return `${baseClasses} glow-effect-constant`;
    default:
      return `${baseClasses}`;
  }
};

export const LinkBlock: React.FC<LinkBlockProps> = ({
  content,
  isEditing = false,
  onChange,
}) => {
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <LinkIcon size={16} />
          <span>Блок ссылки</span>
        </div>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange?.({ ...content, title: e.target.value })}
          placeholder="Заголовок ссылки"
          className={inputClass}
        />
        <input
          type="url"
          value={content.url || ''}
          onChange={(e) => onChange?.({ ...content, url: e.target.value })}
          placeholder="https://example.com"
          className={inputClass}
        />
        <input
          type="text"
          value={content.description || ''}
          onChange={(e) =>
            onChange?.({ ...content, description: e.target.value })
          }
          placeholder="Описание (необязательно)"
          className={inputClass}
        />
        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Эффект анимации кнопки</label>
          <div className="grid grid-cols-1 gap-2">
            {animationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange?.({ ...content, animation: option.value })}
                className={`px-4 py-2 rounded-lg text-left transition-all ${
                  content.animation === option.value
                    ? 'bg-blue-500/30 border-2 border-blue-400'
                    : 'bg-white/5 border border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-xs text-white/60">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const animation = content.animation || 'pulse';
  const animationClasses = getAnimationClasses(animation);

  return (
    <>
      <style>{`
        @keyframes shine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .shine-effect-constant {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.2) 100%
          );
          background-size: 200% auto;
          animation: shine 2s linear infinite;
        }
        
        @keyframes slide {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        
        .slide-effect-constant::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: slide 3s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.4),
                        0 0 15px rgba(255, 255, 255, 0.3),
                        0 0 25px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.6),
                        0 0 30px rgba(255, 255, 255, 0.5),
                        0 0 45px rgba(255, 255, 255, 0.4);
          }
        }
        
        .glow-effect-constant {
          animation: glow 2.5s ease-in-out infinite;
        }
        
        @keyframes pulse-constant {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        
        .animate-pulse-constant {
          animation: pulse-constant 2s ease-in-out infinite;
        }
        
        @keyframes bounce-constant {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .animate-bounce-constant {
          animation: bounce-constant 2s ease-in-out infinite;
        }
      `}</style>
      <a
        href={content.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={animationClasses}
      >
        <div className="font-semibold relative z-10">{content.title || 'Без названия'}</div>
        {content.description && (
          <div className="text-sm opacity-80 mt-1 relative z-10">{content.description}</div>
        )}
      </a>
    </>
  );
};

