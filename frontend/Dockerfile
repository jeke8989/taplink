FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости (React 19 + react-quill требуют legacy peer deps)
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Аргумент для API URL
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Собираем приложение
RUN npm run build

# Production stage с nginx
FROM nginx:alpine

# Копируем конфигурацию nginx (ПЕРЕД dist, чтобы изменения всегда применялись)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

