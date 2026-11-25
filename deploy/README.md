# Deploy a producción — BundleSystem

## Arquitectura en el servidor

```
Internet ──HTTPS──> nginx (:443)
                     ├── /            → frontend/dist (estáticos de Vite)
                     └── /api/        → 127.0.0.1:3000 (Express + PM2)
                                          └── MySQL (DB externa o local)
```

## 1. Preparar el servidor (una sola vez)

```bash
# Node.js 20+
# MySQL client (para importar la BD)
# nginx
# PM2
npm i -g pm2

# Clonar el repo
cd /var/www
git clone <URL-DEL-REPO> bundlesystem
cd bundlesystem
```

## 2. Base de datos

```bash
# Crear la base (si no existe)
mysql -h <DB_HOST> -u <DB_USER> -p -e "CREATE DATABASE IF NOT EXISTS bundle_system CHARACTER SET utf8mb4;"

# Importar estructura + usuarios/perfiles
mysql -h <DB_HOST> -u <DB_USER> -p bundle_system \
  < backend/database/setup_with_users.sql
```

## 3. Variables de entorno

```bash
# Backend
cp backend/.env.production.example backend/.env
nano backend/.env   # EDITAR: DB_*, JWT_SECRET (generar uno nuevo), CORS_ORIGIN

# Frontend
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production   # EDITAR: VITE_API_URL
```

Generar JWT_SECRET nuevo:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 4. nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/bundlesystem
sudo nano /etc/nginx/sites-available/bundlesystem   # EDITAR: tudominio.com, rutas
sudo ln -s /etc/nginx/sites-available/bundlesystem /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS con certificado gratuito
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

Ajustar `root` en nginx.conf a la ruta real de `frontend/dist`.

## 5. Deploys siguientes

```bash
bash deploy/deploy.sh
```

El script hace: `git pull` → `npm ci` backend → build frontend → reload PM2 → health check.

## 6. Operación

```bash
pm2 status                  # estado del API
pm2 logs bundlesystem-api    # logs
pm2 restart bundlesystem-api # reinicio manual

# Backup de uploads (fotos de entregas/perfiles)
# backup de la BD:
mysqldump -h <DB_HOST> -u <DB_USER> -p bundle_system > backup_$(date +%F).sql
```

## Checklist final

- [ ] `backend/.env` con `NODE_ENV=production`, `TRUST_PROXY=1`, `CORS_ORIGIN` del dominio real
- [ ] `JWT_SECRET` nuevo y largo (no el de desarrollo)
- [ ] `frontend/.env.production` con `VITE_API_URL` correcto
- [ ] `setup_with_users.sql` importado en la BD de producción
- [ ] HTTPS activo (certbot)
- [ ] `uploads/` con permisos de escritura para el usuario de PM2
- [ ] Backups automáticos de BD y `uploads/` configurados
