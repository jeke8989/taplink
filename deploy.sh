#!/bin/bash

# Скрипт для установки Taplink на сервер
# Использование: ./deploy.sh

SERVER_IP="144.124.246.190"
SERVER_PASSWORD="t7A28TmY7LMQq7776ebf"
REPO_URL="https://github.com/jeke8989/taplink.git"

echo "🚀 Начинаю установку Taplink на сервер $SERVER_IP"

# Определяем username (пробуем root, затем ubuntu)
for USERNAME in root ubuntu admin; do
    echo "Попытка подключения как $USERNAME..."
    
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
        ${USERNAME}@${SERVER_IP} "echo 'Connected as $USERNAME'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Подключение успешно как $USERNAME"
        break
    fi
done

if [ $? -ne 0 ]; then
    echo "❌ Не удалось подключиться. Попробуйте подключиться вручную:"
    echo "ssh root@$SERVER_IP"
    exit 1
fi

echo "📦 Устанавливаю зависимости на сервере..."

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    # Обновление системы
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get upgrade -y
    
    # Установка Docker и Docker Compose
    if ! command -v docker &> /dev/null; then
        echo "Устанавливаю Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER || usermod -aG docker root
    fi
    
    # Установка Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "Устанавливаю Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Установка Git
    apt-get install -y git
    
    echo "✅ Зависимости установлены"
ENDSSH

echo "📥 Клонирую репозиторий..."

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} << ENDSSH
    cd /root || cd /home/$USERNAME || cd ~
    
    # Удаляем старую версию если есть
    if [ -d "taplink" ]; then
        echo "Удаляю старую версию..."
        rm -rf taplink
    fi
    
    # Клонируем репозиторий
    git clone $REPO_URL taplink
    cd taplink
    
    echo "✅ Репозиторий склонирован"
ENDSSH

echo "⚙️ Настраиваю переменные окружения..."

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    cd ~/taplink || cd /root/taplink || cd /home/*/taplink
    
    # Создаем .env файл
    cat > .env << 'ENVFILE'
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=taplink_secure_password_$(openssl rand -hex 8)
DB_NAME=taplink
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
NODE_ENV=production
VITE_API_URL=http://144.124.246.190:3000
ENVFILE
    
    # Генерируем реальные значения
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
    
    echo "✅ .env файл создан"
    echo "📝 Сохраните эти данные:"
    echo "DB_PASSWORD: ${DB_PASS}"
    echo "JWT_SECRET: ${JWT_SECRET}"
ENDSSH

echo "🐳 Запускаю Docker Compose..."

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    cd ~/taplink || cd /root/taplink || cd /home/*/taplink
    
    # Останавливаем старые контейнеры если есть
    docker-compose down 2>/dev/null || true
    
    # Собираем и запускаем
    docker-compose build --no-cache
    docker-compose up -d
    
    echo "⏳ Ожидаю запуск контейнеров..."
    sleep 10
    
    # Проверяем статус
    docker-compose ps
    docker-compose logs --tail=50
ENDSSH

echo ""
echo "✅ Установка завершена!"
echo ""
echo "🌐 Приложение доступно по адресам:"
echo "   Frontend: http://144.124.246.190"
echo "   Backend API: http://144.124.246.190:3000"
echo ""
echo "📊 Для проверки статуса выполните на сервере:"
echo "   docker-compose ps"
echo "   docker-compose logs -f"

