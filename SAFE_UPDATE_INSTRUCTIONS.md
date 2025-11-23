# Безопасное обновление приложения на сервере

## ⚠️ ВАЖНО: База данных НЕ будет затронута

Этот скрипт обновления специально разработан для сохранения всех данных пользователей.

## Способ 1: Автоматическое обновление (рекомендуется)

### Шаг 1: Подключитесь к серверу
```bash
ssh root@144.124.246.190
# Пароль: t7A28TmY7LMQq7776ebf
```

### Шаг 2: Перейдите в директорию проекта
```bash
cd /root/biohub
```

### Шаг 3: Скачайте скрипт обновления
```bash
curl -o update-on-server.sh https://raw.githubusercontent.com/jeke8989/taplink/main/update-on-server.sh
chmod +x update-on-server.sh
```

### Шаг 4: Запустите скрипт
```bash
./update-on-server.sh
```

Скрипт автоматически:
- ✅ Создаст резервную копию базы данных
- ✅ Сохранит конфигурацию (.env)
- ✅ Обновит код из репозитория
- ✅ Пересоберет только frontend и backend (БД не трогает)
- ✅ Запустит обновленные контейнеры

## Способ 2: Ручное обновление

Если хотите выполнить обновление вручную:

```bash
# 1. Подключитесь к серверу
ssh root@144.124.246.190

# 2. Перейдите в директорию проекта
cd /root/biohub

# 3. Создайте бэкап базы данных (ВАЖНО!)
mkdir -p backups
docker-compose exec -T postgres pg_dump -U postgres biohub > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Сохраните .env файл
cp .env .env.backup

# 5. Обновите код
git fetch origin
git checkout main
git pull origin main

# 6. Восстановите .env
cp .env.backup .env

# 7. Остановите только frontend и backend (НЕ postgres!)
docker-compose stop backend frontend

# 8. Пересоберите контейнеры
docker-compose build --no-cache backend frontend

# 9. Запустите все сервисы
docker-compose up -d

# 10. Проверьте статус
docker-compose ps
docker-compose logs --tail=30 backend
```

## Что гарантирует безопасность:

1. **База данных не останавливается** - контейнер postgres продолжает работать
2. **Данные в volume** - все данные хранятся в Docker volume `postgres_data`, который не удаляется
3. **Бэкап перед обновлением** - создается резервная копия на случай проблем
4. **Только пересборка кода** - обновляются только frontend и backend контейнеры

## Проверка после обновления:

```bash
# Проверьте статус контейнеров
docker-compose ps

# Проверьте логи
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 frontend

# Проверьте доступность
curl https://biohub.pro
curl https://biohub.pro/api/health
```

## В случае проблем:

Если что-то пошло не так, вы можете восстановить из бэкапа:

```bash
# Остановите приложение
docker-compose stop

# Восстановите базу данных из бэкапа
docker-compose start postgres
sleep 5
docker-compose exec -T postgres psql -U postgres -d biohub < backups/backup_YYYYMMDD_HHMMSS.sql

# Или откатите код
git checkout <предыдущий-коммит>
docker-compose build --no-cache backend frontend
docker-compose up -d
```

## Контакты:

Если возникли проблемы, проверьте:
- Логи: `docker-compose logs -f`
- Статус: `docker-compose ps`
- Дисковое пространство: `df -h`
- Память: `free -h`

