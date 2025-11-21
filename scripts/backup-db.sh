#!/bin/bash

# Скрипт автоматического бэкапа базы данных BioHub
# Создает сжатый бэкап, проверяет целостность и удаляет старые бэкапы

set -euo pipefail

# Настройки
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/root/biohub-backups"
LOG_FILE="/var/log/biohub-backup.log"
RETENTION_DAYS=7

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Загружаем переменные из .env
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
else
    log "ERROR: .env file not found at $PROJECT_DIR/.env"
    exit 1
fi

# Проверяем наличие контейнера
if ! docker ps | grep -q "biohub-postgres"; then
    log "ERROR: biohub-postgres container is not running"
    exit 1
fi

# Генерируем имя файла бэкапа
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="biohub_backup_${DATE}.sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

log "Starting backup: $BACKUP_FILE"

# Создаем бэкап
if docker exec biohub-postgres pg_dump -U "${DB_USERNAME:-postgres}" -d "${DB_NAME:-biohub}" > "$BACKUP_PATH" 2>&1; then
    log "Backup dump created successfully"
else
    log "ERROR: Failed to create backup dump"
    rm -f "$BACKUP_PATH"
    exit 1
fi

# Проверяем размер файла (должен быть больше 0)
if [ ! -s "$BACKUP_PATH" ]; then
    log "ERROR: Backup file is empty"
    rm -f "$BACKUP_PATH"
    exit 1
fi

# Сжимаем бэкап
log "Compressing backup..."
if gzip "$BACKUP_PATH"; then
    BACKUP_PATH="${BACKUP_PATH}.gz"
    log "Backup compressed: $BACKUP_PATH"
else
    log "ERROR: Failed to compress backup"
    exit 1
fi

# Проверяем целостность сжатого файла
log "Verifying backup integrity..."
if gzip -t "$BACKUP_PATH" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log "Backup integrity check passed. Size: $BACKUP_SIZE"
else
    log "ERROR: Backup file integrity check failed"
    rm -f "$BACKUP_PATH"
    exit 1
fi

# Удаляем старые бэкапы (старше RETENTION_DAYS дней)
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted $DELETED_COUNT old backup(s)"
else
    log "No old backups to delete"
fi

# Показываем статистику
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup completed successfully: $BACKUP_PATH"
log "Total backups: $TOTAL_BACKUPS, Total size: $TOTAL_SIZE"

exit 0

