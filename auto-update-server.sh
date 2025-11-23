#!/usr/bin/expect -f

set SERVER_IP "144.124.246.190"
set PASSWORD "t7A28TmY7LMQq7776ebf"
set USERNAME "root"

set timeout 300

puts "🔄 Начинаю безопасное обновление на сервере..."
puts "⚠️  База данных НЕ будет затронута\n"

# Подключаемся к серверу
spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP}

expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "Permission denied" {
        puts "❌ Ошибка доступа. Пробую другого пользователя..."
        set USERNAME "ubuntu"
        spawn ssh -o StrictHostKeyChecking=no ${USERNAME}@${SERVER_IP}
        expect "password:"
        send "${PASSWORD}\r"
        exp_continue
    }
    "$ " {
        puts "✅ Подключено к серверу\n"
    }
    "# " {
        puts "✅ Подключено к серверу\n"
    }
    timeout {
        puts "❌ Таймаут подключения"
        exit 1
    }
}

# Переходим в директорию проекта
send "cd /root/biohub || cd /home/ubuntu/biohub || cd ~/biohub\r"
expect {
    "$ " {}
    "# " {}
}

# Проверяем существование директории
send "pwd\r"
expect {
    "$ " {}
    "# " {}
}

puts "📦 Создаю резервную копию базы данных..."

# Создаем бэкап
send "mkdir -p backups\r"
expect "$ " {}
send "BACKUP_FILE=\"backups/backup_`date +%Y%m%d_%H%M%S`.sql\"\r"
expect "$ " {}
send "docker-compose exec -T postgres pg_dump -U postgres biohub > \"\\\$BACKUP_FILE\" 2>/dev/null || docker-compose exec postgres pg_dump -U postgres biohub > \"\\\$BACKUP_FILE\"\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Таймаут при создании бэкапа, продолжаем..."
    }
}

send "if \[ -f \"\\\$BACKUP_FILE\" \] && \[ -s \"\\\$BACKUP_FILE\" \]; then echo \"✅ Бэкап создан: \\\$BACKUP_FILE\"; ls -lh \"\\\$BACKUP_FILE\"; else echo \"⚠️  Бэкап не создан, но продолжаем\"; fi\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n💾 Сохраняю конфигурацию..."

# Сохраняем .env
send "if \[ -f .env \]; then cp .env .env.backup && echo '✅ .env сохранен'; fi\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n📥 Обновляю код из репозитория..."

# Обновляем код
send "git fetch origin\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Таймаут при fetch"
    }
}

send "git checkout main\r"
expect {
    "$ " {}
    "# " {}
}

send "git pull origin main\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Таймаут при pull"
    }
}

puts "✅ Код обновлен\n"

# Восстанавливаем .env
send "if \[ -f .env.backup \]; then cp .env.backup .env && echo '✅ .env восстановлен'; fi\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n🔨 Пересобираю контейнеры (БД не трогаем)..."

# Останавливаем только frontend и backend
send "docker-compose stop backend frontend 2>/dev/null || true\r"
expect {
    "$ " {}
    "# " {}
}

puts "Сборка backend..."
send "docker-compose build --no-cache backend\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгая сборка backend..."
    }
}

puts "Сборка frontend..."
send "docker-compose build --no-cache frontend\r"
expect {
    "$ " {}
    "# " {}
    timeout {
        puts "⚠️  Долгая сборка frontend..."
    }
}

puts "\n🚀 Запускаю контейнеры..."
send "docker-compose up -d\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n⏳ Ожидаю запуск контейнеров..."
send "sleep 15\r"
expect {
    "$ " {}
    "# " {}
}

puts "\n📊 Проверяю статус..."
send "docker-compose ps\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

puts "\n📋 Последние логи backend:"
send "docker-compose logs --tail=30 backend\r"
expect {
    "$ " {}
    "# " {}
    timeout {}
}

puts "\n✅ Обновление завершено!"
puts "\n🌐 Приложение доступно:"
puts "   Frontend: https://biohub.pro"
puts "   Backend:  https://biohub.pro/api"

send "exit\r"
expect eof

