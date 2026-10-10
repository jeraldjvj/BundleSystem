# BundleSystem

Aplicación full-stack para gestión de bundles, con backend en Node.js/Express y frontend en React.

## Estructura del Proyecto

```
bundle-system/
├── backend/               # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuración de base de datos
│   │   ├── routes/        # Definición de endpoints
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── repositories/  # Acceso a datos (SQL)
│   │   ├── middlewares/   # Middleware de validación
│   │   ├── schemas/       # Esquemas Zod
│   │   ├── utils/         # Utilidades
│   │   ├── app.js         # Configuración de Express
│   │   └── server.js      # Punto de entrada
│   ├── database/
│   │   └── schema.sql     # Esquema de base de datos
│   ├── .env              # Variables de entorno (no versionado)
│   └── package.json
├── frontend/              # Aplicación React (Vite)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios API
│   │   └── App.jsx        # Componente principal
│   └── package.json
└── package.json           # Scripts raíz
```

## Requisitos Previos

- Node.js >= 20
- MySQL
- npm

## Configuración

### 1. Base de Datos

Ejecuta el script SQL para crear la base de datos y las tablas:

```bash
mysql -u root -p < backend/database/schema.sql
```

O abre `backend/database/schema.sql` en MySQL Workbench y ejecútalo.

### 2. Variables de Entorno

Copia el archivo de ejemplo y completa las credenciales de MySQL:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus credenciales:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=bundle_system
```

### 3. Instalación de Dependencias

Instala todas las dependencias (raíz, backend y frontend):

```bash
npm run install:all
```

## Uso

### Desarrollo

Ejecuta backend y frontend simultáneamente:

```bash
npm run dev
```

- Backend: http://localhost:3000/api/v1
- Frontend: http://localhost:5173

### Ejecutar por separado

Solo backend:
```bash
npm run dev:backend
```

Solo frontend:
```bash
npm run dev:frontend
```

### Producción

```bash
npm run start:backend
npm run start:frontend
```

## API Endpoints (prefijo `/api/v1`)

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

## Tecnologías

### Backend
- Node.js
- Express
- MySQL
- Zod (validación)
- CORS

### Frontend
- React
- Vite
- Axios

## Añadir Nuevos Recursos

Para añadir un nuevo recurso al backend:
1. Crea la tabla en `backend/database/schema.sql`
2. Crea el schema en `backend/src/schemas/x.schema.js`
3. Crea el repository en `backend/src/repositories/x.repository.js`
4. Crea el controller en `backend/src/controllers/x.controller.js`
5. Crea las rutas en `backend/src/routes/x.routes.js`
6. Regístralo en `backend/src/routes/index.js`
