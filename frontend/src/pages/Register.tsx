import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password);
      navigate('/editor');
    } catch (err: unknown) {
      const fallback = 'Ошибка регистрации';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        setError(response?.data?.message ?? fallback);
      } else {
        setError(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            BioHub
          </p>
          <h2 className="text-3xl font-semibold mt-3">Создайте аккаунт</h2>
          <p className="text-white/60 mt-2">
            Соберите свою BioHub-страницу за несколько минут
          </p>
        </div>
        <div className="bg-gradient-to-b from-[#2a0f25] to-[#7b1334] rounded-[30px] p-8 shadow-2xl border border-white/10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm text-white/70 mb-1 block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm text-white/70 mb-1 block">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white/90 text-[#540c24] font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div className="text-center text-sm text-white/70">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-white hover:text-white/80 underline">
                Войти
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

