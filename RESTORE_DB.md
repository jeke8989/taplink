# Инструкция по восстановлению базы данных на localhost

## Проблема
Блоки не появляются в редакторе на localhost, потому что локальная база данных не восстановлена из production.

## Решение

### Шаг 1: Запустите Docker Desktop
1. Откройте приложение **Docker Desktop**
2. Дождитесь полного запуска (иконка Docker в строке меню должна быть зеленой)

### Шаг 2: Восстановите базу данных

**Вариант А: Автоматический (рекомендуется)**

```bash
cd /Users/evgenijkukuskin/Documents/Проекты/cursor/taplink
./scripts/restore-local-db.sh
```

Скрипт автоматически:
- Проверит наличие дампа
- Запустит PostgreSQL контейнер
- Восстановит базу данных из дампа

**Вариант Б: Вручную**

```bash
# 1. Перейдите в директорию проекта
cd /Users/evgenijkukuskin/Documents/Проекты/cursor/taplink

# 2. Запустите PostgreSQL
docker compose up -d postgres

# 3. Подождите 5 секунд пока БД запустится
sleep 5

# 4. Удалите старую базу (если есть)
docker exec biohub-postgres psql -U postgres -c "DROP DATABASE IF EXISTS biohub;"

# 5. Создайте новую базу
docker exec biohub-postgres psql -U postgres -c "CREATE DATABASE biohub;"

# 6. Восстановите из дампа
gunzip -c /tmp/biohub_dump.sql.gz | docker exec -i biohub-postgres psql -U postgres -d biohub
```

### Шаг 3: Проверьте восстановление

```bash
# Проверьте количество блоков
docker exec biohub-postgres psql -U postgres -d biohub -c "SELECT COUNT(*) FROM blocks;"

# Проверьте пользователей
docker exec biohub-postgres psql -U postgres -d biohub -c "SELECT email, username FROM users LIMIT 5;"
```

### Шаг 4: Перезапустите бэкенд

После восстановления базы данных перезапустите бэкенд:

```bash
# Остановите текущий процесс бэкенда (Ctrl+C в терминале)
# Затем запустите снова:
cd backend
npm run start:dev
```

### Шаг 5: Войдите в редактор

1. Откройте `http://localhost:5174`
2. Войдите под пользователем, у которого есть блоки
3. Блоки должны появиться в редакторе

## Проверка

После восстановления проверьте:

1. **База данных работает:**
   ```bash
   docker ps | grep biohub-postgres
   ```

2. **Блоки есть в базе:**
   ```bash
   docker exec biohub-postgres psql -U postgres -d biohub -c "SELECT COUNT(*) FROM blocks;"
   ```
   Должно быть больше 0

3. **API возвращает блоки:**
   ```bash
   curl http://localhost:3000/page/ev_kukushkin | jq '.blocks | length'
   ```
   Должно быть больше 0

4. **В редакторе блоки загружаются:**
   - Откройте консоль браузера (F12)
   - Должны быть логи: `Loaded blocks: X`

## Устранение проблем

### Ошибка: "Cannot connect to Docker daemon"
**Решение:** Запустите Docker Desktop

### Ошибка: "Dump file not found"
**Решение:** Дамп должен быть в `/tmp/biohub_dump.sql.gz`. Если его нет, скачайте снова с production сервера.

### Блоки все еще не появляются
1. Проверьте, что вы вошли под правильным пользователем (email должен соответствовать пользователю с блоками)
2. Проверьте консоль браузера на ошибки
3. Проверьте логи бэкенда: `tail -f /tmp/biohub-backend.log`
4. Убедитесь, что бэкенд подключен к локальной базе (проверьте `.env` файл)

## Дополнительная информация

- Дамп базы данных: `/tmp/biohub_dump.sql.gz`
- Скрипт восстановления: `./scripts/restore-local-db.sh`
- Логи бэкенда: `/tmp/biohub-backend.log`

