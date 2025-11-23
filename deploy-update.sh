#!/usr/bin/expect -f

set timeout 1200
set SERVER_IP "144.124.246.190"
set PASSWORD "t7A28TmY7LMQq7776ebf"

puts "\n=========================================="
puts "🔄 Безопасное обновление на сервере"
puts "⚠️  База данных НЕ будет затронута"
puts "==========================================\n"

spawn ssh -o StrictHostKeyChecking=no root@${SERVER_IP}

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
puts "📦 Шаг 1/6: Создание бэкапа БД..."
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

send "docker-compose exec -T postgres pg_dump -U postgres biohub > \\\$BACKUP_FILE 2>&1\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгий бэкап, продолжаем..."
    }
}

send "ls -lh \\\$BACKUP_FILE 2>/dev/null && echo '✅ Бэкап создан' || echo '⚠️  Бэкап не создан'\r"
expect {
    "$ " {}
    "# " {}
}

# Сохраняем .env
puts "\n💾 Шаг 2/6: Сохранение конфигурации..."
send "cp .env .env.backup 2>/dev/null && echo '✅ .env сохранен' || echo '⚠️  .env не найден'\r"
expect {
    "$ " {}
    "# " {}
}

# Обновляем код
puts "\n📥 Шаг 3/6: Обновление кода..."
send "if test -d .git; then git fetch origin 2>&1 && git checkout main 2>&1 && git pull origin main 2>&1 && echo '✅ Код обновлен'; else echo '⚠️  Git репозиторий не найден, используем текущий код'; fi\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

# Восстанавливаем .env
puts "\n🔧 Шаг 4/6: Восстановление конфигурации..."
send "if test -f .env.backup; then cp .env.backup .env && echo '✅ .env восстановлен'; fi\r"
expect {
    "$ " {}
    "# " {}
}

# Останавливаем контейнеры
puts "\n🛑 Шаг 5/6: Остановка контейнеров..."
send "docker-compose stop backend frontend 2>/dev/null && echo '✅ Контейнеры остановлены' || echo '⚠️  Контейнеры уже остановлены'\r"
expect {
    "$ " {}
    "# " {}
}

# Собираем и запускаем
puts "\n🔨 Шаг 6/6: Пересборка и запуск..."
send "echo 'Сборка backend...'\r"
expect {
    "$ " {}
    "# " {}
}

send "docker-compose build --no-cache backend 2>&1 | tail -5\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

send "echo 'Сборка frontend...'\r"
expect {
    "$ " {}
    "# " {}
}

send "docker-compose build --no-cache frontend 2>&1 | tail -5\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

send "echo 'Запуск контейнеров...'\r"
expect {
    "$ " {}
    "# " {}
}

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

puts "\n📊 Проверка статуса..."
send "docker-compose ps\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

puts "\n=========================================="
puts "✅ Обновление завершено!"
puts "🌐 Приложение: https://biohub.pro"
puts "==========================================\n"

send "exit\r"
expect eof

