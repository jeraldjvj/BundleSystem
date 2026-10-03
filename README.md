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

### Health Check
| Método | Ruta    | Descripción  |
|--------|---------|--------------|
| GET    | /health | Health check |

### Bundle Colors
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /bundle-colors          | Listar colores de bundles|
| GET    | /bundle-colors/:id      | Obtener un color         |
| POST   | /bundle-colors          | Crear color              |
| PATCH  | /bundle-colors/:id      | Actualizar color         |
| DELETE | /bundle-colors/:id      | Eliminar color           |

### Bundle Models
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /bundle-models          | Listar modelos de bundles|
| GET    | /bundle-models/:id      | Obtener un modelo        |
| POST   | /bundle-models          | Crear modelo             |
| PATCH  | /bundle-models/:id      | Actualizar modelo        |
| DELETE | /bundle-models/:id      | Eliminar modelo          |

### Projects
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /projects               | Listar proyectos         |
| GET    | /projects/:id           | Obtener un proyecto      |
| POST   | /projects               | Crear proyecto           |
| PATCH  | /projects/:id           | Actualizar proyecto      |
| DELETE | /projects/:id           | Eliminar proyecto        |

### Users
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /users                  | Listar usuarios          |
| GET    | /users/:id              | Obtener un usuario       |
| POST   | /users                  | Crear usuario            |
| PATCH  | /users/:id              | Actualizar usuario       |
| DELETE | /users/:id              | Eliminar usuario         |

### Bundles
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /bundles                | Listar bundles           |
| GET    | /bundles/:id            | Obtener un bundle        |
| POST   | /bundles                | Crear bundle             |
| PATCH  | /bundles/:id            | Actualizar bundle        |
| DELETE | /bundles/:id            | Eliminar bundle          |

### Smartphone Colors
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /smartphone-colors      | Listar colores de smartphones|
| GET    | /smartphone-colors/:id  | Obtener un color         |
| POST   | /smartphone-colors      | Crear color              |
| PATCH  | /smartphone-colors/:id  | Actualizar color         |
| DELETE | /smartphone-colors/:id  | Eliminar color           |

### Smartphone Models
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /smartphone-models      | Listar modelos de smartphones|
| GET    | /smartphone-models/:id  | Obtener un modelo        |
| POST   | /smartphone-models      | Crear modelo             |
| PATCH  | /smartphone-models/:id  | Actualizar modelo        |
| DELETE | /smartphone-models/:id  | Eliminar modelo          |

### Smartphones
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /smartphones            | Listar smartphones       |
| GET    | /smartphones/:id        | Obtener un smartphone    |
| POST   | /smartphones            | Crear smartphone         |
| PATCH  | /smartphones/:id        | Actualizar smartphone    |
| DELETE | /smartphones/:id        | Eliminar smartphone      |

### Bundle Delivered
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /bundle-delivered       | Listar bundles entregados|
| GET    | /bundle-delivered/:id   | Obtener un bundle entregado|
| POST   | /bundle-delivered       | Crear bundle entregado   |
| PATCH  | /bundle-delivered/:id   | Actualizar bundle entregado|
| DELETE | /bundle-delivered/:id   | Eliminar bundle entregado|

### Stores
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /stores                 | Listar tiendas           |
| GET    | /stores/:code           | Obtener una tienda       |
| POST   | /stores                 | Crear tienda             |
| PATCH  | /stores/:code           | Actualizar tienda        |
| DELETE | /stores/:code           | Eliminar tienda          |

### User Profiles
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /user-profiles          | Listar perfiles de usuarios|
| GET    | /user-profiles/:id      | Obtener un perfil        |
| POST   | /user-profiles          | Crear perfil             |
| PATCH  | /user-profiles/:id      | Actualizar perfil        |
| DELETE | /user-profiles/:id      | Eliminar perfil          |

Para añadir un recurso nuevo: crea su tabla en `database/schema.sql`, `schemas/x.schema.js`, `repositories/x.repository.js`, `controllers/x.controller.js`, `routes/x.routes.js` y regístralo en `routes/index.js`.
