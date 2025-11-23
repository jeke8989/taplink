#!/usr/bin/expect -f

set SERVER_IP "144.124.246.190"
set PASSWORD "t7A28TmY7LMQq7776ebf"
set USERNAME "root"

set timeout 900

puts "\n🔄 Безопасное обновление на сервере..."
puts "⚠️  База данных НЕ будет затронута\n"

spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP}

expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "$ " {}
    "# " {}
    timeout {
        puts "❌ Таймаут подключения"
        exit 1
    }
}

# Переходим в директорию
send "cd /root/biohub\r"
expect {
    "$ " {}
    "# " {}
}

# Бэкап БД
puts "📦 Создаю бэкап БД..."
send "mkdir -p backups && BACKUP_FILE=backups/backup_`date +%Y%m%d_%H%M%S`.sql && docker-compose exec -T postgres pg_dump -U postgres biohub > \\\$BACKUP_FILE 2>&1 && echo 'Бэкап создан: '\\\$BACKUP_FILE || echo 'Бэкап пропущен'\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

# Сохраняем .env
puts "💾 Сохраняю .env..."
send "cp .env .env.backup 2>/dev/null; echo 'OK'\r"
expect {
    "$ " {}
    "# " {}
}

# Проверяем git и обновляем
puts "📥 Обновляю код..."
send "if \[ -d .git \]; then git fetch origin && git checkout main && git pull origin main && echo 'Код обновлен'; else echo 'Клонирую репозиторий...' && cd /root && rm -rf biohub && GIT_TERMINAL_PROMPT=0 git clone https://github.com/jeke8989/taplink.git biohub && cd biohub && git checkout main && echo 'Репозиторий склонирован'; fi\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

# Восстанавливаем .env
send "if \[ -f .env.backup \]; then cp .env.backup .env && echo '.env восстановлен'; fi\r"
expect {
    "$ " {}
    "# " {}
}

# Останавливаем контейнеры
puts "🔨 Пересобираю контейнеры..."
send "docker-compose stop backend frontend 2>/dev/null; echo 'Контейнеры остановлены'\r"
expect {
    "$ " {}
    "# " {}
}

# Собираем backend
puts "Сборка backend..."
send "docker-compose build --no-cache backend\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

# Собираем frontend
puts "Сборка frontend..."
send "docker-compose build --no-cache frontend\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

# Запускаем
puts "🚀 Запускаю контейнеры..."
send "docker-compose up -d\r"
expect {
    "$ " {}
    "# " {}
}

send "sleep 15 && docker-compose ps\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

puts "\n✅ Обновление завершено!"
puts "🌐 https://biohub.pro\n"

send "exit\r"
expect eof

