#!/bin/bash

# Скрипт проверки бэкапов базы данных
# Проверяет наличие бэкапов за последние 7 дней и их целостность

set -euo pipefail

# Настройки
BACKUP_DIR="/root/biohub-backups"
RETENTION_DAYS=7
MIN_BACKUPS=7  # Минимум бэкапов за период

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "BioHub Database Backup Check"
echo "=========================================="
echo ""

# Проверяем существование директории
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}ERROR: Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

# Подсчитываем бэкапы за последние 7 дней
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f -mtime -$RETENTION_DAYS 2>/dev/null | wc -l)

echo "Backup directory: $BACKUP_DIR"
echo "Retention period: $RETENTION_DAYS days"
echo ""

# Проверяем количество бэкапов
if [ "$BACKUP_COUNT" -eq 0 ]; then
    echo -e "${RED}WARNING: No backups found in the last $RETENTION_DAYS days!${NC}"
    echo ""
elif [ "$BACKUP_COUNT" -lt "$MIN_BACKUPS" ]; then
    echo -e "${YELLOW}WARNING: Only $BACKUP_COUNT backup(s) found in the last $RETENTION_DAYS days (expected at least $MIN_BACKUPS)${NC}"
    echo ""
else
    echo -e "${GREEN}OK: Found $BACKUP_COUNT backup(s) in the last $RETENTION_DAYS days${NC}"
    echo ""
fi

# Находим последний бэкап
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}ERROR: No backup files found${NC}"
    exit 1
fi

echo "Latest backup: $(basename "$LATEST_BACKUP")"
LATEST_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
LATEST_DATE=$(stat -c %y "$LATEST_BACKUP" | cut -d' ' -f1)
echo "Size: $LATEST_SIZE"
echo "Date: $LATEST_DATE"
echo ""

# Проверяем целостность последнего бэкапа
echo "Checking backup integrity..."
if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}OK: Latest backup integrity check passed${NC}"
else
    echo -e "${RED}ERROR: Latest backup integrity check failed!${NC}"
    echo "The backup file may be corrupted."
    exit 1
fi

echo ""

# Показываем список всех бэкапов за последние 7 дней
echo "Backups in the last $RETENTION_DAYS days:"
echo "----------------------------------------"
find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f -mtime -$RETENTION_DAYS -printf '%T@ %p\n' 2>/dev/null | sort -n | while read timestamp filepath; do
    filename=$(basename "$filepath")
    size=$(du -h "$filepath" | cut -f1)
    date=$(stat -c %y "$filepath" | cut -d' ' -f1,2 | cut -d'.' -f1)
    echo "  $filename ($size, $date)"
done

echo ""

# Общая статистика
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "biohub_backup_*.sql.gz" -type f 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo "Total backups: $TOTAL_BACKUPS"
echo "Total size: $TOTAL_SIZE"
echo ""

# Финальный статус
if [ "$BACKUP_COUNT" -ge "$MIN_BACKUPS" ] && gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    echo -e "${GREEN}=========================================="
    echo "Backup status: OK"
    echo "==========================================${NC}"
    exit 0
else
    echo -e "${YELLOW}=========================================="
    echo "Backup status: WARNING"
    echo "==========================================${NC}"
    exit 1
fi

