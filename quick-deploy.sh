#!/bin/bash
# Быстрая установка через expect (если установлен)

SERVER_IP="144.124.246.190"
PASSWORD="t7A28TmY7LMQq7776ebf"
REPO_URL="https://github.com/jeke8989/biohub.git"

# Пробуем разные username
for USERNAME in root ubuntu admin; do
    echo "Попытка подключения как $USERNAME..."
    
    expect << EOF
spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP} "echo 'Connected'"
expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "Connected" {
        puts "✅ Подключено как $USERNAME"
        exit 0
    }
    timeout {
        puts "❌ Таймаут"
        exit 1
    }
}
EOF

    if [ $? -eq 0 ]; then
        WORKING_USER=$USERNAME
        break
    fi
done

if [ -z "$WORKING_USER" ]; then
    echo "❌ Не удалось подключиться. Запустите install-on-server.sh вручную"
    exit 1
fi

echo "Устанавливаю на сервер как $WORKING_USER..."

