# Инструкция по деплою BioHub

## Вариант 1: Деплой с Docker Compose (Рекомендуется)

### Требования
- Docker и Docker Compose установлены на сервере
- Минимум 2GB RAM
- Открытые порты: 80 (frontend), 3000 (backend, опционально)

### Шаги деплоя

1. **Скопируйте проект на сервер:**
```bash
git clone <ваш-репозиторий> biohub
cd biohub
```

2. **Создайте файл `.env` в корне проекта:**
```bash
cp .env.example .env
nano .env  # или используйте любой редактор
```

3. **Настройте переменные окружения в `.env`:**
```env
DB_USERNAME=postgres
DB_PASSWORD=ваш-надежный-пароль
DB_NAME=biohub
JWT_SECRET=ваш-очень-надежный-секретный-ключ-минимум-32-символа
JWT_EXPIRES_IN=7d
VITE_API_URL=https://ваш-домен.com/api
```

4. **Запустите приложение:**
```bash
docker-compose up -d
```

5. **Проверьте статус:**
```bash
docker-compose ps
docker-compose logs -f
```

### Обновление приложения

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Вариант 2: Деплой без Docker (VPS)

### Требования
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- PostgreSQL 14+
- Nginx

### Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Установка Nginx
sudo apt install -y nginx

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

### Настройка PostgreSQL

```bash
sudo -u postgres psql
```

В PostgreSQL консоли:
```sql
CREATE DATABASE biohub;
CREATE USER biohub_user WITH PASSWORD 'ваш-пароль';
GRANT ALL PRIVILEGES ON DATABASE biohub TO biohub_user;
\q
```

### Деплой Backend

```bash
cd ~
git clone <ваш-репозиторий> biohub
cd biohub/backend

# Установка зависимостей
npm install

# Создание .env файла
nano .env
```

Содержимое `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=biohub_user
DB_PASSWORD=ваш-пароль
DB_NAME=biohub
JWT_SECRET=ваш-секретный-ключ
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

```bash
# Сборка
npm run build

# Запуск с PM2
pm2 start dist/main.js --name biohub-backend
pm2 save
pm2 startup  # Следуйте инструкциям для автозапуска
```

### Деплой Frontend

```bash
cd ~/biohub/frontend

# Установка зависимостей
npm install

# Создание .env.production
echo "VITE_API_URL=http://ваш-домен.com:3000" > .env.production

# Сборка
npm run build

# Копирование в Nginx
sudo cp -r dist/* /var/www/biohub/
```

### Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/biohub
```

Содержимое:
```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;

    root /var/www/biohub;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/biohub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Настройка SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com
```

---

## Вариант 3: Деплой на Vercel/Netlify (Frontend) + Railway/Render (Backend)

### Backend на Railway/Render

1. Подключите репозиторий
2. Укажите команду сборки: `npm run build`
3. Укажите команду запуска: `npm run start:prod`
4. Добавьте переменные окружения из `.env.example`

### Frontend на Vercel/Netlify

1. Подключите репозиторий
2. Укажите директорию: `frontend`
3. Команда сборки: `npm run build`
4. Директория вывода: `dist`
5. Добавьте переменную окружения: `VITE_API_URL=https://ваш-backend-url.com`

---

## Проверка работоспособности

После деплоя проверьте:

1. **Backend API:**
```bash
curl http://ваш-домен.com:3000/auth/login
# Должен вернуть ошибку валидации (это нормально)
```

2. **Frontend:**
Откройте в браузере: `http://ваш-домен.com`

3. **База данных:**
```bash
docker-compose exec postgres psql -U postgres -d biohub -c "\dt"
# или
psql -U biohub_user -d biohub -c "\dt"
```

---

## Мониторинг и логи

### Docker Compose
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### PM2
```bash
pm2 logs biohub-backend
pm2 monit
```

### Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Резервное копирование базы данных

```bash
# Docker
docker-compose exec postgres pg_dump -U postgres biohub > backup.sql

# Без Docker
pg_dump -U biohub_user biohub > backup.sql

# Восстановление
psql -U biohub_user biohub < backup.sql
```

---

## Troubleshooting

### Backend не запускается
- Проверьте логи: `docker-compose logs backend` или `pm2 logs`
- Убедитесь, что PostgreSQL доступен
- Проверьте переменные окружения в `.env`

### Frontend не подключается к API
- Проверьте `VITE_API_URL` в `.env.production`
- Убедитесь, что CORS настроен в backend
- Проверьте настройки Nginx proxy

### Ошибки базы данных
- Проверьте подключение: `psql -U biohub_user -d biohub`
- Убедитесь, что миграции выполнены (TypeORM создаст таблицы автоматически при первом запуске)

