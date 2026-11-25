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
COPY deploy/start-contenedor.sh /app/start.sh

# Build del frontend
RUN cd /app/frontend && npm run build

# Dar permisos al script
RUN chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]
