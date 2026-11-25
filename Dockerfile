FROM node:20-alpine

# Instalar nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copiar archivos del proyecto
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependencias
RUN npm ci
RUN cd /app/backend && npm ci --omit=dev
RUN cd /app/frontend && npm ci

# Copiar código fuente
COPY backend ./backend/
COPY frontend ./frontend/
COPY deploy/nginx-contenedor.conf /etc/nginx/nginx.conf

# Build del frontend
RUN cd /app/frontend && npm run build

# Crear script de inicio
RUN echo '#!/bin/sh\nnginx\ncd /app/backend && node src/server.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
