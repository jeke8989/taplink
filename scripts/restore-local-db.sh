#!/bin/bash

# Скрипт восстановления базы данных из production дампа в локальную dev среду

set -euo pipefail

DUMP_FILE="/tmp/biohub_dump.sql.gz"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "BioHub Local Database Restore"
echo "=========================================="
echo ""

# Проверяем наличие дампа
if [ ! -f "$DUMP_FILE" ]; then
    echo "ERROR: Dump file not found: $DUMP_FILE"
    echo "Please download the dump from production server first."
    exit 1
fi

# Проверяем что Docker запущен
if ! docker ps > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Проверяем что контейнер postgres запущен
if ! docker ps | grep -q "biohub-postgres"; then
    echo "Starting PostgreSQL container..."
    cd "$PROJECT_DIR"
    docker compose up -d postgres
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Проверяем что контейнер готов
if ! docker exec biohub-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "ERROR: PostgreSQL container is not ready. Please wait a moment and try again."
    exit 1
fi

echo "Dump file: $DUMP_FILE"
echo "Database: biohub"
echo ""

# Предупреждение
echo "WARNING: This will REPLACE all data in the local database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Удаляем существующую базу данных и создаем новую
echo "Dropping existing database..."
docker exec biohub-postgres psql -U postgres -c "DROP DATABASE IF EXISTS biohub;" 2>/dev/null || true

echo "Creating new database..."
docker exec biohub-postgres psql -U postgres -c "CREATE DATABASE biohub;" 2>/dev/null || true

# Восстанавливаем из дампа
echo "Restoring database from dump..."
if gunzip -c "$DUMP_FILE" | docker exec -i biohub-postgres psql -U postgres -d biohub; then
    echo ""
    echo "=========================================="
    echo "Database restored successfully!"
    echo "=========================================="
    echo ""
    echo "You can now access the pages on localhost:"
    echo "  - Frontend: http://localhost:5174"
    echo "  - Backend: http://localhost:3000"
    echo ""
else
    echo ""
    echo "ERROR: Failed to restore database"
    exit 1
fi

