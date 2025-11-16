#!/bin/bash
# Скрипт для установки на сервер
# Запустите этот скрипт и введите пароль при запросе

SERVER_IP="144.124.246.190"
REPO_URL="https://github.com/jeke8989/taplink.git"

echo "🚀 Установка Taplink на сервер $SERVER_IP"
echo "Введите пароль сервера при запросе: t7A28TmY7LMQq7776ebf"
echo ""

# Определяем username
read -p "Введите username (root/ubuntu/admin): " USERNAME
USERNAME=${USERNAME:-root}

echo "📦 Устанавливаю зависимости..."

ssh ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    export DEBIAN_FRONTEND=noninteractive
    
    # Обновление
    apt-get update -y
    apt-get upgrade -y
    
    # Docker
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER 2>/dev/null || usermod -aG docker root
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Git
    apt-get install -y git openssl
    
    echo "✅ Зависимости установлены"
ENDSSH

echo "📥 Клонирую репозиторий..."

ssh ${USERNAME}@${SERVER_IP} << ENDSSH
    cd /root 2>/dev/null || cd /home/$USERNAME 2>/dev/null || cd ~
    
    if [ -d "taplink" ]; then
        rm -rf taplink
    fi
    
    git clone $REPO_URL taplink
    cd taplink
    
    echo "✅ Репозиторий склонирован"
ENDSSH

echo "⚙️ Настраиваю .env..."

ssh ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    cd ~/taplink || cd /root/taplink || cd /home/*/taplink
    
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
    
    echo "✅ .env создан"
    echo "🔑 Сохраните пароли:"
    echo "DB_PASSWORD: ${DB_PASS}"
    echo "JWT_SECRET: ${JWT_SECRET}"
ENDSSH

echo "🐳 Запускаю приложение..."

ssh ${USERNAME}@${SERVER_IP} << 'ENDSSH'
    cd ~/taplink || cd /root/taplink || cd /home/*/taplink
    
    docker-compose down 2>/dev/null || true
    docker-compose build --no-cache
    docker-compose up -d
    
    sleep 15
    
    echo "📊 Статус контейнеров:"
    docker-compose ps
    
    echo ""
    echo "📋 Последние логи:"
    docker-compose logs --tail=20
ENDSSH

echo ""
echo "✅ Установка завершена!"
echo "🌐 Приложение: http://144.124.246.190"

