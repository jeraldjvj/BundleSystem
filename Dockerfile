FROM node:20-alpine

WORKDIR /app

# Crear carpeta para uploads (volumen persistente)
RUN mkdir -p /app/backend/uploads

# Copiar solo backend
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
RUN cd /app/backend && npm ci --omit=dev

# Copiar código del backend
COPY backend ./backend/

# Volumen persistente para uploads (no se pierde entre deploys)
VOLUME ["/app/backend/uploads"]

# Exponer puerto del backend
EXPOSE 3000

# Iniciar backend
CMD ["node", "/app/backend/src/server.js"]
