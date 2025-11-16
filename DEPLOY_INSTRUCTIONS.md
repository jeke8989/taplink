# Инструкция по установке на сервер 144.124.246.190

## Способ 1: Автоматическая установка (требует sshpass)

Если у вас установлен sshpass:
```bash
./deploy.sh
```

## Способ 2: Полуавтоматическая установка (рекомендуется)

Запустите скрипт и введите пароль при запросе:
```bash
./install-on-server.sh
```

## Способ 3: Ручная установка

### Шаг 1: Подключитесь к серверу
```bash
ssh root@144.124.246.190
# Пароль: t7A28TmY7LMQq7776ebf
```

### Шаг 2: Установите зависимости
```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Git и OpenSSL
apt-get install -y git openssl
```

### Шаг 3: Клонируйте репозиторий
```bash
cd /root
git clone https://github.com/jeke8989/taplink.git
cd taplink
```

### Шаг 4: Создайте .env файл
```bash
DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASS}
DB_NAME=taplink
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
NODE_ENV=production
VITE_API_URL=http://144.124.246.190:3000
EOF

echo "Сохраните эти данные:"
echo "DB_PASSWORD: ${DB_PASS}"
echo "JWT_SECRET: ${JWT_SECRET}"
```

### Шаг 5: Запустите приложение
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Шаг 6: Проверьте статус
```bash
docker-compose ps
docker-compose logs -f
```

## Доступ к приложению

После установки приложение будет доступно:
- **Frontend:** http://144.124.246.190
- **Backend API:** http://144.124.246.190:3000

## Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Обновление
cd /root/taplink
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

