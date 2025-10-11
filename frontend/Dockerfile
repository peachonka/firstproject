FROM node:20-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Финальный образ с nginx
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]