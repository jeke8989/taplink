#!/bin/bash

SERVER_IP="144.124.246.190"
PASSWORD="t7A28TmY7LMQq7776ebf"
USERNAME="root"

echo "🔄 Безопасное обновление на сервере..."
echo "⚠️  База данных НЕ будет затронута"

# Создаем SSH команду
ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} << 'EOF'

cd /root/biohub

# Бэкап БД
echo "📦 Создаю бэкап БД..."
mkdir -p backups
BACKUP_FILE=backups/backup_$(date +%Y%m%d_%H%M%S).sql
docker-compose exec -T postgres pg_dump -U postgres biohub > $BACKUP_FILE 2>&1 || docker-compose exec postgres pg_dump -U postgres biohub > $BACKUP_FILE 2>&1

# Сохраняем .env
echo "💾 Сохраняю .env..."
cp .env .env.backup 2>/dev/null || true

# Обновляем код
echo "📥 Обновляю код..."
if [ -d .git ]; then 
  git fetch origin && git checkout main && git pull origin main
else 
  echo "⚠️  Git репозиторий не найден, клонирую..."
  cd /root && rm -rf biohub && git clone https://github.com/jeke8989/taplink.git biohub && cd biohub
fi

echo "✅ Код обновлен"

# Восстанавливаем .env
cp .env.backup .env 2>/dev/null || true

# Останавливаем контейнеры
echo "🔨 Пересобираю контейнеры..."
docker-compose stop backend frontend 2>/dev/null || true

# Собираем
echo "Сборка backend..."
docker-compose build --no-cache backend

echo "Сборка frontend..."
docker-compose build --no-cache frontend

# Запускаем
echo "🚀 Запускаю..."
docker-compose up -d

sleep 10

echo ""
echo "📊 Статус:"
docker-compose ps

echo ""
echo "✅ Обновление завершено!"
echo "🌐 https://biohub.pro"

EOF
