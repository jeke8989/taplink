#!/usr/bin/expect -f

set timeout 600
set SERVER_IP "144.124.246.190"
set PASSWORD "t7A28TmY7LMQq7776ebf"

puts "\n📤 Загружаю скрипт на сервер и выполняю обновление...\n"

# Загружаем скрипт на сервер
spawn scp -o StrictHostKeyChecking=no server-update.sh root@${SERVER_IP}:/root/biohub/

expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "100%" {
        puts "✅ Скрипт загружен"
    }
    timeout {
        puts "❌ Таймаут загрузки"
        exit 1
    }
}

expect eof

# Подключаемся и выполняем
spawn ssh -o StrictHostKeyChecking=no root@${SERVER_IP}

expect {
    "password:" {
        send "${PASSWORD}\r"
        exp_continue
    }
    "$ " {}
    "# " {}
}

send "cd /root/biohub && chmod +x server-update.sh && bash server-update.sh\r"

expect {
    "✅ Готово" {
        puts "\n✅ Обновление успешно завершено!"
    }
    "❌" {
        puts "\n❌ Ошибка при обновлении"
    }
    timeout {
        puts "\n⚠️  Процесс может еще выполняться..."
    }
}

expect eof

