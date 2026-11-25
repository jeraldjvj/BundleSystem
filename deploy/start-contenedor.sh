#!/usr/bin/env bash
# Script de inicio para Nixpacks — nginx + backend en el mismo contenedor
set -euo pipefail

# Copiar config de nginx
cp deploy/nginx-contenedor.conf /etc/nginx/nginx.conf

# Iniciar nginx en background
nginx

# Iniciar backend (node espera por el puerto, nginx está listo)
cd backend
node src/server.js
