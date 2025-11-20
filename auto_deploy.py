#!/usr/bin/env python3
"""
Автоматическая установка BioHub на сервер
"""
import subprocess
import sys
import time

SERVER_IP = "144.124.246.190"
PASSWORD = "t7A28TmY7LMQq7776ebf"
REPO_URL = "https://github.com/jeke8989/biohub.git"

def run_ssh_command(username, command):
    """Выполняет команду через SSH с паролем"""
    try:
        # Используем ssh с expect для автоматического ввода пароля
        expect_script = f'''
spawn ssh -o StrictHostKeyChecking=no {username}@{SERVER_IP} "{command}"
expect "password:"
send "{PASSWORD}\\r"
expect eof
'''
        result = subprocess.run(
            ['expect', '-c', expect_script],
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.returncode == 0, result.stdout, result.stderr
    except FileNotFoundError:
        print("❌ expect не установлен. Установите: brew install expect")
        return False, "", "expect not found"
    except subprocess.TimeoutExpired:
        return False, "", "Timeout"

def main():
    print("🚀 Начинаю установку BioHub на сервер...")
    
    # Пробуем разные username
    for username in ['root', 'ubuntu', 'admin']:
        print(f"\n📡 Пробую подключиться как {username}...")
        success, stdout, stderr = run_ssh_command(username, "echo 'Connected'")
        
        if success and 'Connected' in stdout:
            print(f"✅ Подключено как {username}")
            working_user = username
            break
    else:
        print("❌ Не удалось подключиться. Выполните установку вручную:")
        print("   ssh root@144.124.246.190")
        print("   Пароль: t7A28TmY7LMQq7776ebf")
        sys.exit(1)
    
    # Установка зависимостей
    print("\n📦 Устанавливаю зависимости...")
    deps_script = """
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
    usermod -aG docker root 2>/dev/null || true
fi
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
apt-get install -y git openssl
echo "DONE"
"""
    
    success, stdout, stderr = run_ssh_command(working_user, deps_script)
    if success:
        print("✅ Зависимости установлены")
    else:
        print(f"⚠️ Ошибка: {stderr}")
    
    # Клонирование репозитория
    print("\n📥 Клонирую репозиторий...")
    clone_script = f"""
cd /root 2>/dev/null || cd /home/{working_user} 2>/dev/null || cd ~
if [ -d "biohub" ]; then rm -rf biohub; fi
git clone {REPO_URL} biohub
cd biohub
echo "DONE"
"""
    
    success, stdout, stderr = run_ssh_command(working_user, clone_script)
    if success:
        print("✅ Репозиторий склонирован")
    else:
        print(f"⚠️ Ошибка: {stderr}")
    
    # Создание .env
    print("\n⚙️ Настраиваю переменные окружения...")
    env_script = """
cd ~/biohub || cd /root/biohub || cd /home/*/biohub
DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASS}
DB_NAME=biohub
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
NODE_ENV=production
VITE_API_URL=https://biohub.pro/api
EOF
echo "DB_PASSWORD: ${DB_PASS}" > credentials.txt
echo "JWT_SECRET: ${JWT_SECRET}" >> credentials.txt
cat credentials.txt
echo "DONE"
"""
    
    success, stdout, stderr = run_ssh_command(working_user, env_script)
    if success:
        print("✅ .env файл создан")
        if 'DB_PASSWORD' in stdout:
            print("\n🔑 Сохраните эти данные:")
            for line in stdout.split('\n'):
                if 'DB_PASSWORD' in line or 'JWT_SECRET' in line:
                    print(f"   {line}")
    
    # Запуск Docker Compose
    print("\n🐳 Запускаю приложение...")
    run_script = """
cd ~/biohub || cd /root/biohub || cd /home/*/biohub
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d
sleep 20
docker-compose ps
echo "DONE"
"""
    
    success, stdout, stderr = run_ssh_command(working_user, run_script)
    if success:
        print("✅ Приложение запущено")
        print("\n📊 Статус:")
        print(stdout)
    else:
        print(f"⚠️ Ошибка: {stderr}")
    
    print("\n" + "="*50)
    print("✅ Установка завершена!")
    print("🌐 Приложение доступно:")
    print("   Frontend: https://biohub.pro")
    print("   Backend:  https://biohub.pro/api")
    print("="*50)

if __name__ == "__main__":
    main()

