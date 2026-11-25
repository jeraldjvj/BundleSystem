#!/bin/sh
set -e

echo "=========================================="
echo "Iniciando contenedor BundleSystem"
echo "NODE_ENV=${NODE_ENV:-not set}"
echo "PORT=${PORT:-not set}"
echo "DB_HOST=${DB_HOST:-not set}"
echo "=========================================="

# Verificar que existe el directorio del frontend
if [ ! -d "/app/frontend/dist" ]; then
  echo "ERROR: /app/frontend/dist no existe. El build del frontend falló."
  exit 1
fi

# Verificar que nginx esté configurado
if [ ! -f "/etc/nginx/nginx.conf" ]; then
  echo "ERROR: /etc/nginx/nginx.conf no existe. El Dockerfile debería haberlo copiado."
  exit 1
fi

echo "==> Validando config de nginx"
nginx -t

echo "==> Iniciando nginx"
nginx 2>&1 &
NGINX_PID=$!
echo "Nginx arrancado con PID $NGINX_PID"

# Verificar que nginx esté escuchando
sleep 3
if ! nc -z localhost 80; then
  echo "ERROR: nginx no está escuchando en puerto 80"
  echo "=== Logs de nginx ==="
  cat /var/log/nginx/error.log 2>/dev/null || echo "No se pudo leer error.log"
  exit 1
fi
echo "OK: nginx escuchando en puerto 80"

# Si DB_HOST no está configurado, solo nginx
if [ -z "${DB_HOST:-}" ]; then
  echo "WARNING: DB_HOST no configurado. El backend no arrancará."
  echo "Solo nginx está corriendo. Configura las variables en Dockplay."
  # Mantener contenedor vivo
  tail -f /dev/null
fi

echo "==> Iniciando backend"
cd /app/backend
node src/server.js
