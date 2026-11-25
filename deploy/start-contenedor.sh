#!/usr/bin/env bash
# Script de inicio para Nixpacks — nginx + backend en el mismo contenedor
set -e

echo "==> Copiando config de nginx"
cp deploy/nginx-contenedor.conf /etc/nginx/nginx.conf

echo "==> Iniciando nginx en puerto 3000"
nginx

echo "==> Iniciando backend (NODE_ENV=${NODE_ENV:-development})"
cd backend

# Si DB_HOST no está configurado, no arrancar el backend (solo nginx)
if [ -z "${DB_HOST:-}" ]; then
  echo "WARNING: DB_HOST no configurado. El backend no arrancará. Configura las variables en Dockplay."
  # Mantener el contenedor vivo con nginx
  tail -f /dev/null
fi

node src/server.js
