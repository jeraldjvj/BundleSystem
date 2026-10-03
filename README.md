# BundleSystem API

API REST con Node.js + Express, validación con Zod y base de datos MySQL.

## Estructura

```
src/
├── config/         # Variables de entorno y pool de conexiones MySQL (database.js)
├── routes/         # Definición de endpoints (index.js agrupa todos los routers)
├── controllers/    # Manejo de req/res, orquesta la lógica
├── repositories/   # Acceso a datos (consultas SQL)
├── middlewares/    # validate, notFound, errorHandler
├── schemas/        # Esquemas Zod de validación
├── utils/          # HttpError, asyncHandler
├── app.js          # Configuración de Express
└── server.js       # Punto de entrada
database/
└── schema.sql      # Crea la base de datos y las tablas
```

## Base de datos (MySQL)

1. Crea la base de datos y las tablas (te pedirá la contraseña de MySQL):
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   También puedes abrir `database/schema.sql` en MySQL Workbench y ejecutarlo.
2. Copia `.env.example` a `.env` y completa `DB_USER`, `DB_PASSWORD` y, si cambian, `DB_HOST`, `DB_PORT` y `DB_NAME`.

Al arrancar, el servidor comprueba la conexión; si falla, muestra el error y se detiene.

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

Para añadir un recurso nuevo: crea su tabla en `database/schema.sql`, `schemas/x.schema.js`, `repositories/x.repository.js`, `controllers/x.controller.js`, `routes/x.routes.js` y regístralo en `routes/index.js`.
