#!/usr/bin/expect -f

set SERVER_IP "144.124.246.190"
set PASSWORD "t7A28TmY7LMQq7776ebf"
set USERNAME "root"

set timeout 600

puts "🔄 Безопасное обновление на сервере..."
puts "⚠️  База данных НЕ будет затронута\n"

spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP}

expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "$ " {
        puts "✅ Подключено\n"
    }
    "# " {
        puts "✅ Подключено\n"
    }
    timeout {
        puts "❌ Таймаут"
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
send "mkdir -p backups\r"
expect {
    "$ " {}
    "# " {}
}

send "BACKUP_FILE=backups/backup_`date +%Y%m%d_%H%M%S`.sql\r"
expect {
    "$ " {}
    "# " {}
}

send "docker-compose exec -T postgres pg_dump -U postgres biohub > \\\$BACKUP_FILE 2>&1 || docker-compose exec postgres pg_dump -U postgres biohub > \\\$BACKUP_FILE 2>&1\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгий бэкап, продолжаем..."
    }
}

# Сохраняем .env
puts "💾 Сохраняю .env..."
send "cp .env .env.backup 2>/dev/null || true\r"
expect {
    "$ " {}
    "# " {}
}

# Обновляем код
puts "📥 Обновляю код..."
send "if \[ -d .git \]; then git fetch origin && git checkout main && git pull origin main; else echo '⚠️  Git репозиторий не найден, клонирую...' && cd /root && rm -rf biohub && git clone https://github.com/jeke8989/taplink.git biohub && cd biohub; fi\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгое обновление..."
    }
}

puts "✅ Код обновлен\n"

# Восстанавливаем .env
send "cp .env.backup .env 2>/dev/null || true\r"
expect {
    "$ " {}
    "# " {}
}

# Останавливаем контейнеры
puts "🔨 Пересобираю контейнеры..."
send "docker-compose stop backend frontend 2>/dev/null || true\r"
expect {
    "$ " {}
    "# " {}
}

# Собираем
puts "Сборка backend..."
send "docker-compose build --no-cache backend\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгая сборка..."
    }
}

puts "Сборка frontend..."
send "docker-compose build --no-cache frontend\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгая сборка..."
    }
}

# Запускаем
puts "🚀 Запускаю..."
send "docker-compose up -d\r"
expect {
    "$ " {}
    "# " {}
}

send "sleep 10\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n📊 Статус:"
send "docker-compose ps\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

puts "\n✅ Обновление завершено!"
puts "🌐 https://biohub.pro"

send "exit\r"
expect eof

