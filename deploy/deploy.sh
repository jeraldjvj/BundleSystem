#!/usr/bin/env bash
# ============================================================
# BundleSystem — Deploy a producción
# Ejecutar EN EL SERVIDOR desde la raíz del proyecto:
#   bash deploy/deploy.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> [1/6] Actualizando código (git pull)"
git pull --ff-only

echo "==> [2/6] Backend: dependencias de producción"
cd backend
npm ci --omit=dev

echo "==> [3/6] Verificando .env de producción"
if [ ! -f .env ]; then
  echo "ERROR: backend/.env no existe."
  exit 1
fi
if grep -q "cambia-esto\|pega-aqui" .env; then
  echo "ERROR: backend/.env"
  exit 1
fi

echo "==> [4/6] Frontend: build de producción"
cd ../frontend
if [ ! -f .env.production ]; then
  echo "AVISO: frontend/.env.production no existe"
  cp .env.production
  echo ">>> EDITA frontend/.env.production con tu VITE_API_URL y vuelve a ejecutar"
  exit 1
fi
npm ci
npm run build

echo "==> [5/6] Reiniciando API con PM2"
cd ../backend
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
  pm2 save
else
  echo "AVISO: pm2 no instalado. Instálalo con: npm i -g pm2"
  echo "       Luego: pm2 start ecosystem.config.js && pm2 save"
fi

echo "==> [6/6] Verificación"
sleep 2
if curl -sf http://127.0.0.1:3000/api/v1/health >/dev/null; then
  echo "OK — API respondiendo en http://127.0.0.1:3000/api/v1"
else
  echo "ERROR — la API no responde. Revisa: pm2 logs bundlesystem-api"
  exit 1
fi

echo ""
echo "Deploy completo. Recuerda recargar nginx si cambió la config:"
echo "  sudo nginx -t && sudo systemctl reload nginx"
