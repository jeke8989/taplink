# Taplink - Full-Stack приложение

Клон Taplink - сервис для создания персональных страниц со ссылками.

## Технологии

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Nest.js + TypeScript + PostgreSQL + TypeORM
- **Аутентификация:** JWT

## Быстрый старт (разработка)

### Требования
- Node.js 18+
- PostgreSQL 14+

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd taplink
```

2. **Настройте Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env с вашими настройками БД
npm run start:dev
```

3. **Настройте Frontend:**
```bash
cd ../frontend
npm install
npm run dev
```

Приложение будет доступно на:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Деплой на сервер

Подробные инструкции по деплою смотрите в файле [DEPLOY.md](./DEPLOY.md)

### Быстрый деплой с Docker:

```bash
# 1. Создайте .env файл
cp .env.example .env
nano .env  # Настройте переменные

# 2. Запустите
docker-compose up -d

# 3. Проверьте логи
docker-compose logs -f
```

## Структура проекта

```
taplink/
├── backend/          # Nest.js API
│   ├── src/
│   │   ├── auth/     # Аутентификация
│   │   ├── users/     # Пользователи
│   │   ├── profile/   # Профили
│   │   └── page/      # Публичные страницы
│   └── Dockerfile
├── frontend/         # React приложение
│   ├── src/
│   │   ├── pages/    # Страницы
│   │   ├── components/ # Компоненты
│   │   └── api/      # API клиент
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Публичные
- `GET /page/:username` - Публичная страница пользователя

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

### Защищенные (требуют JWT токен)
- `GET /profile/me` - Получить свой профиль
- `PUT /profile/me` - Обновить профиль

## Переменные окружения

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=taplink
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173  # Для CORS
```

### Frontend (.env.production)
```env
VITE_API_URL=http://localhost:3000
```

## Лицензия

ISC

