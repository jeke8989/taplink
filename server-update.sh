#!/bin/bash
# Простой скрипт для выполнения НА СЕРВЕРЕ
# Загрузите его на сервер и выполните: bash server-update.sh

set -e

echo "🔄 Безопасное обновление"
echo "⚠️  База данных НЕ будет затронута"
echo ""

cd /root/biohub || { echo "❌ Директория не найдена"; exit 1; }

# Бэкап
echo "📦 Бэкап БД..."
mkdir -p backups
BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U postgres biohub > "$BACKUP_FILE" 2>&1 || true
[ -s "$BACKUP_FILE" ] && echo "✅ Бэкап: $BACKUP_FILE" || echo "⚠️  Бэкап пропущен"

# Сохраняем .env
echo "💾 Сохраняю .env..."
[ -f .env ] && cp .env .env.backup && echo "✅ .env сохранен"

# Обновляем код (если есть git)
echo "📥 Обновляю код..."
if [ -d .git ]; then
    git fetch origin 2>&1 || true
    git checkout main 2>&1 || true
    git pull origin main 2>&1 && echo "✅ Код обновлен" || echo "⚠️  Ошибка обновления кода"
else
    echo "⚠️  Git не найден, используем текущий код"
fi

# Восстанавливаем .env
[ -f .env.backup ] && cp .env.backup .env && echo "✅ .env восстановлен"

# Останавливаем
echo "🛑 Останавливаю контейнеры..."
docker-compose stop backend frontend 2>/dev/null || true

# Собираем
echo "🔨 Собираю backend..."
docker-compose build --no-cache backend

echo "🔨 Собираю frontend..."
docker-compose build --no-cache frontend

# Запускаем
echo "🚀 Запускаю..."
docker-compose up -d

sleep 10

echo ""
echo "📊 Статус:"
docker-compose ps

echo ""
echo "✅ Готово! https://biohub.pro"

