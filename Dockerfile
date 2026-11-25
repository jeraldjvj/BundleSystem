# Dockerfile alternativo para Dockploy si nixpacks.toml falla
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
RUN cd backend && npm ci --omit=dev
RUN cd ../frontend && npm ci

# Copiar código fuente
COPY backend ./backend/
COPY frontend ./frontend/
COPY deploy/nginx-contenedor.conf /etc/nginx/nginx.conf

# Build del frontend
RUN cd frontend && npm run build

# Crear script de inicio
RUN echo '#!/bin/sh\nnginx\ncd backend && node src/server.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080 3000

CMD ["/app/start.sh"]
