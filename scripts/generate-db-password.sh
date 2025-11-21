#!/bin/bash

# Скрипт генерации сложного пароля для базы данных
# Генерирует пароль длиной 32 символа с буквами, цифрами и специальными символами

set -euo pipefail

# Настройки
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PASSWORD_LENGTH=32

# Функция генерации пароля
generate_password() {
    # Используем /dev/urandom для генерации случайных байт
    # Конвертируем в base64 и удаляем нежелательные символы
    # Оставляем только буквы (a-z, A-Z), цифры (0-9) и некоторые специальные символы (!@#$%^&*)
    local password
    password=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-$PASSWORD_LENGTH)
    
    # Убеждаемся что пароль содержит разные типы символов
    # Если нет, генерируем заново
    local has_lower has_upper has_digit has_special
    has_lower=$(echo "$password" | grep -o '[a-z]' | wc -l)
    has_upper=$(echo "$password" | grep -o '[A-Z]' | wc -l)
    has_digit=$(echo "$password" | grep -o '[0-9]' | wc -l)
    
    # Если пароль не содержит достаточно разнообразия, добавляем символы
    if [ "$has_lower" -eq 0 ] || [ "$has_upper" -eq 0 ] || [ "$has_digit" -eq 0 ]; then
        # Добавляем недостающие типы символов
        local missing_chars=""
        [ "$has_lower" -eq 0 ] && missing_chars="${missing_chars}$(openssl rand -base64 1 | tr -d "=+/" | tr '[:upper:]' '[:lower:]' | cut -c1)"
        [ "$has_upper" -eq 0 ] && missing_chars="${missing_chars}$(openssl rand -base64 1 | tr -d "=+/" | tr '[:lower:]' '[:upper:]' | cut -c1)"
        [ "$has_digit" -eq 0 ] && missing_chars="${missing_chars}$(openssl rand -base64 1 | tr -d "=+/" | grep -o '[0-9]' | head -1)"
        
        # Заменяем последние символы пароля на недостающие
        password="${password:0:$((PASSWORD_LENGTH - ${#missing_chars}))}${missing_chars}"
    fi
    
    echo "$password"
}

# Генерируем пароль
NEW_PASSWORD=$(generate_password)

echo "=========================================="
echo "Generated Database Password"
echo "=========================================="
echo ""
echo "Password: $NEW_PASSWORD"
echo ""
echo "Password length: ${#NEW_PASSWORD} characters"
echo ""

# Спрашиваем, обновить ли .env файл
if [ -f "$PROJECT_DIR/.env" ]; then
    read -p "Do you want to update .env file with this password? (yes/no): " UPDATE_ENV
    
    if [ "$UPDATE_ENV" = "yes" ]; then
        # Создаем резервную копию .env
        cp "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Обновляем пароль в .env
        if grep -q "^DB_PASSWORD=" "$PROJECT_DIR/.env"; then
            # Заменяем существующий пароль
            sed -i.bak "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_PASSWORD/" "$PROJECT_DIR/.env"
            rm -f "$PROJECT_DIR/.env.bak"
        else
            # Добавляем новую строку
            echo "DB_PASSWORD=$NEW_PASSWORD" >> "$PROJECT_DIR/.env"
        fi
        
        echo ""
        echo ".env file updated successfully!"
        echo "Backup of old .env saved."
        echo ""
        echo "IMPORTANT: After updating the password, you need to:"
        echo "1. Update the password in PostgreSQL:"
        echo "   docker exec -it biohub-postgres psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';\""
        echo ""
        echo "2. Restart the backend container:"
        echo "   docker-compose restart backend"
        echo ""
    else
        echo ""
        echo ".env file not updated."
        echo "Please manually update DB_PASSWORD in your .env file and PostgreSQL."
    fi
else
    echo "WARNING: .env file not found at $PROJECT_DIR/.env"
    echo "Please manually add this password to your .env file:"
    echo "DB_PASSWORD=$NEW_PASSWORD"
fi

echo ""
echo "=========================================="
echo "IMPORTANT: Save this password securely!"
echo "=========================================="

