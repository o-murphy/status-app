# Базовий образ для збірки Next.js застосунку
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Етап для подачі статичного контенту за допомогою Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf  # Uncomment this line
COPY nginx.conf /etc/nginx/

COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]