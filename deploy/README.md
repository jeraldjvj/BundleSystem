# Deploy a producción — BundleSystem

## Arquitectura (Dockplay — dos servicios separados)

```
Internet ──HTTPS──> Dockplay reverse proxy
                     ├── bandeos.xiaomibolivia.tech  → Frontend estático (nginx)
                     └── api.xiaomibolivia.tech        → Backend Node.js
                                                       └── MySQL (externa)
```

---

## Configuración en Dockplay

### Servicio 1: Backend — api.xiaomibolivia.tech

**Dockerfile** (sin extensión, solo backend):
- Base: `node:20-alpine`
- Puerto: `3000`
- Comando: `node /app/backend/src/server.js`

**Variables de entorno:**
```bash
NODE_ENV=production
PORT=3000
TRUST_PROXY=1

# Base de datos (MySQL externa)
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

### Servicio 2: Frontend — bandeos.xiaomibolivia.tech

**Dockerfile.frontend** (frontend estático):
- Base: `nginx:alpine`
- Build: compila React con Vite
- Puerto: `80`
- Sirve: `dist/` con fallback SPA

**Variables de entorno:**
```bash
VITE_API_URL=https://api.xiaomibolivia.tech
```

---

## Pasos en Dockplay

### 1. Backend (api.xiaomibolivia.tech)

1. Crea un nuevo servicio en Dockplay (ej. "bundleapp-backend")
2. Conecta el repo
3. Dockerfile: usa el `Dockerfile` raíz (sin extensión)
4. Configura las variables de entorno del backend
5. Domains: agrega `api.xiaomibolivia.tech`
6. Deploy

### 2. Frontend (bandeos.xiaomibolivia.tech)

1. Crea otro servicio en Dockplay (ej. "bundleapp-frontend")
2. Conecta el mismo repo
3. Dockerfile: usa `Dockerfile.frontend`
4. Configura la variable `VITE_API_URL=https://api.xiaomibolivia.tech`
5. Domains: agrega `bandeos.xiaomibolivia.tech`
6. Deploy

### 3. Base de datos

Importa la estructura + usuarios/perfiles en tu MySQL externa:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p bundle_system \
  < backend/database/setup_with_users.sql
```

---

## Archivos de configuración

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Backend Node.js (api.xiaomibolivia.tech) |
| `Dockerfile.frontend` | Frontend estático nginx (bandeos.xiaomibolivia.tech) |
| `frontend/.env.production` | `VITE_API_URL=https://api.xiaomibolivia.tech` |
| `backend/.env.production.example` | Guía de variables del backend |

---

## Deploy en servidor dedicado (VPS) — alternativa

Si prefieres un VPS con nginx + PM2, sigue `deploy/deploy.sh`.

---

## Checklist final

- [ ] `setup_with_users.sql` importado en la BD de producción
- [ ] `JWT_SECRET` nuevo y largo en el servicio de backend
- [ ] `CORS_ORIGIN=https://bandeos.xiaomibolivia.tech` en el backend
- [ ] `VITE_API_URL=https://api.xiaomibolivia.tech` en el frontend
- [ ] Dos servicios creados en Dockplay con sus Dockerfiles correspondientes
- [ ] Dominios configurados: `api.xiaomibolivia.tech` y `bandeos.xiaomibolivia.tech`
- [ ] Backups automáticos de BD configurados
