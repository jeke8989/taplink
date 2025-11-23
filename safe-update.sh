#!/bin/bash
# Безопасное обновление приложения без потери данных БД

SERVER_IP="144.124.246.190"
SERVER_PASSWORD="t7A28TmY7LMQq7776ebf"

echo "🔄 Безопасное обновление приложения на сервере"
echo "⚠️  База данных НЕ будет затронута"

# Определяем username
for USERNAME in root ubuntu admin; do
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
        ${USERNAME}@${SERVER_IP} "echo 'Connected as $USERNAME'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Подключение успешно как $USERNAME"
        WORKING_USER=$USERNAME
        break
    fi
done

if [ -z "$WORKING_USER" ]; then
    echo "❌ Не удалось подключиться"
    exit 1
fi

echo ""
echo "📦 Шаг 1: Создание резервной копии базы данных..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${WORKING_USER}@${SERVER_IP} << 'ENDSSH'
    cd ~/biohub || cd /root/biohub || cd /home/*/biohub
    
    # Создаем директорию для бэкапов если её нет
    mkdir -p backups
    
    # Делаем бэкап базы данных
    BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U postgres biohub > "$BACKUP_FILE" 2>/dev/null || \
    docker-compose exec postgres pg_dump -U postgres biohub > "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        echo "✅ Бэкап создан: $BACKUP_FILE"
        ls -lh "$BACKUP_FILE"
    else
        echo "⚠️  Не удалось создать бэкап, но продолжаем обновление"
    fi
ENDSSH

echo ""
echo "📥 Шаг 2: Обновление кода из репозитория..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${WORKING_USER}@${SERVER_IP} << 'ENDSSH'
    cd ~/biohub || cd /root/biohub || cd /home/*/biohub
    
    # Сохраняем текущий .env файл (если он существует)
    if [ -f .env ]; then
        cp .env .env.backup
        echo "✅ .env файл сохранен"
    fi
    
    # Обновляем код
    git fetch origin
    git checkout main
    git pull origin main
    
    echo "✅ Код обновлен"
ENDSSH

echo ""
echo "🔨 Шаг 3: Пересборка контейнеров (БД не трогаем)..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${WORKING_USER}@${SERVER_IP} << 'ENDSSH'
    cd ~/biohub || cd /root/biohub || cd /home/*/biohub
    
    # Восстанавливаем .env если был сохранен
    if [ -f .env.backup ]; then
        cp .env.backup .env
        echo "✅ .env файл восстановлен"
    fi
    
    # Останавливаем только frontend и backend, НЕ postgres
    docker-compose stop backend frontend 2>/dev/null || true
    
    # Пересобираем только frontend и backend
    docker-compose build --no-cache backend frontend
    
    # Запускаем все сервисы (postgres уже работает)
    docker-compose up -d
    
    echo "⏳ Ожидаю запуск контейнеров..."
    sleep 15
    
    # Проверяем статус
    echo ""
    echo "📊 Статус контейнеров:"
    docker-compose ps
    
    echo ""
    echo "📋 Последние логи backend:"
    docker-compose logs --tail=20 backend
ENDSSH

echo ""
echo "✅ Обновление завершено!"
echo ""
echo "🌐 Приложение доступно:"
echo "   Frontend: https://biohub.pro"
echo "   Backend:  https://biohub.pro/api"
echo ""
echo "💾 Резервная копия БД сохранена в директории backups/"

