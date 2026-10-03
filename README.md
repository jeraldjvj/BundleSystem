# BundleSystem API

API REST con Node.js + Express, validación con Zod.

## Estructura

```
src/
├── config/         # Variables de entorno y configuración
├── routes/         # Definición de endpoints (index.js agrupa todos los routers)
├── controllers/    # Manejo de req/res, orquesta la lógica
├── repositories/   # Acceso a datos (DB); aquí cambias in-memory por tu ORM
├── middlewares/    # validate, notFound, errorHandler
├── schemas/        # Esquemas Zod de validación
├── utils/          # HttpError, asyncHandler
├── app.js          # Configuración de Express
└── server.js       # Punto de entrada
```

## Uso

```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints (prefijo `/api/v1`)

| Método | Ruta           | Descripción        |
|--------|----------------|--------------------|
| GET    | /health        | Health check       |
| GET    | /bundles       | Listar bundles     |
| GET    | /bundles/:id   | Obtener un bundle  |
| POST   | /bundles       | Crear bundle       |
| PATCH  | /bundles/:id   | Actualizar bundle  |
| DELETE | /bundles/:id   | Eliminar bundle    |

Para añadir un recurso nuevo: crea `schemas/x.schema.js`, `repositories/x.repository.js`, `controllers/x.controller.js`, `routes/x.routes.js` y regístralo en `routes/index.js`.
