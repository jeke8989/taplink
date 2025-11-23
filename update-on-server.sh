#!/bin/bash
# Скрипт для безопасного обновления на сервере
# Выполните этот скрипт НА СЕРВЕРЕ после подключения через SSH

set -e  # Остановка при ошибке

echo "🔄 Безопасное обновление приложения"
echo "⚠️  База данных НЕ будет затронута"
echo ""

cd ~/biohub || cd /root/biohub || cd /home/*/biohub || (echo "❌ Директория biohub не найдена" && exit 1)

# Шаг 1: Бэкап базы данных
echo "📦 Шаг 1: Создание резервной копии базы данных..."
mkdir -p backups
BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"

if docker-compose ps | grep -q "biohub-postgres.*Up"; then
    docker-compose exec -T postgres pg_dump -U postgres biohub > "$BACKUP_FILE" 2>/dev/null || \
    docker-compose exec postgres pg_dump -U postgres biohub > "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        echo "✅ Бэкап создан: $BACKUP_FILE"
        ls -lh "$BACKUP_FILE"
    else
        echo "⚠️  Не удалось создать бэкап, но продолжаем обновление"
    fi
else
    echo "⚠️  Контейнер postgres не запущен, пропускаем бэкап"
fi

# Шаг 2: Сохранение .env
echo ""
echo "💾 Шаг 2: Сохранение конфигурации..."
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env файл сохранен"
fi

# Шаг 3: Обновление кода
echo ""
echo "📥 Шаг 3: Обновление кода из репозитория..."
git fetch origin
git checkout main
git pull origin main
echo "✅ Код обновлен"

# Шаг 4: Восстановление .env
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo "✅ .env файл восстановлен"
fi

# Шаг 5: Пересборка контейнеров (БД не трогаем)
echo ""
echo "🔨 Шаг 4: Пересборка контейнеров (БД не трогаем)..."
# Останавливаем только frontend и backend
docker-compose stop backend frontend 2>/dev/null || true

# Пересобираем только frontend и backend
echo "Сборка backend..."
docker-compose build --no-cache backend

echo "Сборка frontend..."
docker-compose build --no-cache frontend

# Запускаем все сервисы
echo "Запуск контейнеров..."
docker-compose up -d

echo "⏳ Ожидаю запуск контейнеров..."
sleep 15

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "📋 Последние логи backend:"
docker-compose logs --tail=30 backend

echo ""
echo "✅ Обновление завершено!"
echo ""
echo "🌐 Приложение доступно:"
echo "   Frontend: https://biohub.pro"
echo "   Backend:  https://biohub.pro/api"
if [ -f "$BACKUP_FILE" ]; then
    echo ""
    echo "💾 Резервная копия БД: $BACKUP_FILE"
fi

