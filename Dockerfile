FROM node:20-alpine

WORKDIR /app

# Copiar solo backend
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
RUN cd /app/backend && npm ci --omit=dev

# Copiar código del backend
COPY backend ./backend/

# Exponer puerto del backend
EXPOSE 3000

# Iniciar backend
CMD ["node", "/app/backend/src/server.js"]
