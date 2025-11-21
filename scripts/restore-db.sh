#!/bin/bash

# Скрипт восстановления базы данных из бэкапа
# Использование: ./restore-db.sh <path_to_backup_file>

set -euo pipefail

# Настройки
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz or backup_file.sql>"
    echo ""
    echo "Examples:"
    echo "  $0 /root/biohub-backups/biohub_backup_20241120_030000.sql.gz"
    echo "  $0 /root/biohub-backups/biohub_backup_20241120_030000.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Проверяем существование файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Загружаем переменные из .env
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
else
    echo "ERROR: .env file not found at $PROJECT_DIR/.env"
    exit 1
fi

# Проверяем наличие контейнера
if ! docker ps | grep -q "biohub-postgres"; then
    echo "ERROR: biohub-postgres container is not running"
    exit 1
fi

# Предупреждение
echo "=========================================="
echo "WARNING: This will REPLACE all data in the database!"
echo "Database: ${DB_NAME:-biohub}"
echo "Backup file: $BACKUP_FILE"
echo "=========================================="
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Определяем, нужно ли распаковывать
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    TEMP_FILE=$(mktemp)
    if ! gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"; then
        echo "ERROR: Failed to decompress backup file"
        exit 1
    fi
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Восстанавливаем базу данных
echo "Restoring database from backup..."
if docker exec -i biohub-postgres psql -U "${DB_USERNAME:-postgres}" -d "${DB_NAME:-biohub}" < "$RESTORE_FILE" 2>&1; then
    echo "Database restored successfully from $BACKUP_FILE"
else
    echo "ERROR: Failed to restore database"
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 1
fi

# Удаляем временный файл если был создан
[ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"

echo "Restore completed successfully!"

