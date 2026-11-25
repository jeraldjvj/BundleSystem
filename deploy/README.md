# Deploy a producción — BundleSystem

## Arquitectura

### Opción A — Servidor dedicado (nginx + PM2)
```
Internet ──HTTPS──> nginx (:443)
                     ├── /            → frontend/dist (estáticos de Vite)
                     └── /api/        → 127.0.0.1:3000 (Express + PM2)
                                          └── MySQL (DB externa o local)
```
*Ver `deploy/nginx.conf` y `deploy/deploy.sh`*

### Opción B — Contenedor único (Dockploy / Nixpacks)
```
Internet ──HTTPS──> Dockploy reverse proxy
                     └── Contenedor
                           ├── nginx (:8080) → frontend/dist + proxy /api
                           └── backend (:3000) → Express
                                          └── MySQL (externa, ej. Railway/PlanetScale)
```
*Configurado en `nixpacks.toml` y `deploy/nginx-contenedor.conf`*

---

## Deploy en Dockploy (Contenedor único)

### 1. Variables de entorno en Dockploy

Configura estas en el panel de Dockploy:

```bash
NODE_ENV=production
PORT=3000
TRUST_PROXY=1

# Base de datos (MySQL externa, no en el contenedor)
DB_HOST=<host-de-tu-DB>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=bundle_system

# Seguridad
JWT_SECRET=<genera uno nuevo de 96 caracteres hex>
CORS_ORIGIN=https://bandeos.xiaomibolivia.tech
```

Generar JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Base de datos

```bash
# Importar estructura + usuarios/perfiles
mysql -h <DB_HOST> -u <DB_USER> -p bundle_system \
  < backend/database/setup_with_users.sql
```

### 3. Push y deploy

```bash
git push
# Dockploy detectará nixpacks.toml y hará el build automáticamente
```

El build hace:
1. Instala backend + frontend
2. Build del frontend (`npm run build`)
3. Copia config de nginx
4. Arranca nginx (:8080) + backend (:3000) en paralelo

### 4. Dominio y HTTPS

En Dockploy, configura el dominio `bandeos.xiaomibolivia.tech`. El HTTPS lo maneja Dockploy automáticamente.

---

## Deploy en servidor dedicado (VPS)

Si prefieres un VPS propio con nginx + PM2, sigue la guía en `deploy/deploy.sh`.

### 1. Preparar el servidor
```bash
npm i -g pm2
cd /var/www
git clone <URL> bundlesystem
cd bundlesystem
```

### 2. Base de datos
```bash
mysql -h <DB_HOST> -u <DB_USER> -p bundle_system \
  < backend/database/setup_with_users.sql
```

### 3. Variables de entorno
```bash
cp backend/.env.production.example backend/.env
nano backend/.env   # EDITAR
cp frontend/.env.production.example frontend/.env.production
nano frontend/.env.production   # EDITAR
```

### 4. nginx
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/bundlesystem
sudo nano /etc/nginx/sites-available/bundlesystem   # EDITAR: tu dominio
sudo ln -s /etc/nginx/sites-available/bundlesystem /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d bandeos.xiaomibolivia.tech
```

### 5. Deploys siguientes
```bash
bash deploy/deploy.sh
```

---

## Checklist final

- [ ] `setup_with_users.sql` importado en la BD de producción
- [ ] `JWT_SECRET` nuevo y largo (no el de desarrollo)
- [ ] `CORS_ORIGIN` con el dominio real
- [ ] Si es Dockploy: variables configuradas en el panel
- [ ] Si es VPS: HTTPS activo (certbot)
- [ ] Backups automáticos de BD configurados
