# BundleSystem — Arquitectura y Recursos

## Tipo de arquitectura: **Multi-tier (3 capas) — Cliente/Servidor**

```
┌─────────────┐   HTTP/JSON    ┌──────────────┐   SQL    ┌─────────┐
│  FRONTEND   │ ◄────────────► │   BACKEND    │ ◄──────► │  MySQL  │
│ React+Vite  │  REST API      │ Express/Node │          │    BD   │
│ (Capa 1)    │  x-user-id     │ (Capa 2)     │          │ (Capa 3)│
│ :5173       │                │ :3000        │          │ :3306   │
└─────────────┘                └──────────────┘          └─────────┘
     ↑                              ↑
 Cámara/código barras          /uploads (fotos)
```

Es **multi-tier**: presentación → lógica de negocio → datos. También es cliente/servidor clásico: el frontend no conoce SQL, solo consume la API REST del backend.

- **Capa 1 (Presentación):** React SPA servida por Vite — toda la UI, navegación, validaciones de formulario y renderizado de gráficas.
- **Capa 2 (Aplicación/Lógica):** API REST en Express — autenticación, reglas de negocio, control de roles, transacciones, generación de registros de auditoría.
- **Capa 3 (Datos):** MySQL — persistencia de usuarios, inventario, tiendas, entregas e historial.

---

## Recursos del Backend (`backend/`)

| Recurso | Función en el proyecto |
|---|---|
| **Express** | Servidor HTTP y enrutamiento de toda la API REST (`src/routes/`) |
| **mysql2/promise + pool** | Conexión a MySQL con pool de conexiones; SQL directo sin ORM en `repositories/` |
| **Zod** | Validación de bodies/params de peticiones (`src/schemas/`) |
| **bcrypt** | Hash de contraseñas en login y creación de usuarios |
| **Multer** | Upload de fotos (clientes en entregas, fotos de perfil) a `/uploads` |
| **dotenv** | Credenciales de BD y configuración en `.env` |
| **Middleware de usuario activo** | Verifica `x-user-id` en cada petición → 403 si la cuenta está inactiva (expulsa sesiones abiertas) |
| **`/uploads` (estático)** | Almacenamiento y servido de imágenes (fotos de clientes y perfiles) |

### Capas internas del backend

```
routes/        Endpoints HTTP + validación Zod
controllers/   Manejo de req/res y errores HTTP
repositories/  Consultas SQL a la BD
middlewares/   validate, upload de imágenes, usuario activo
schemas/       Esquemas Zod por entidad
```

---

## Recursos del Frontend (`frontend/`)

| Recurso | Función en el proyecto |
|---|---|
| **React + Vite** | SPA con hot-reload; un componente por página/formulario |
| **Axios + interceptores** | Llamadas a la API; envía `x-user-id` automáticamente y cierra sesión ante 403 por cuenta inactiva |
| **AuthContext + localStorage** | Sesión persistida (objeto user) y control de acceso por nivel de perfil |
| **ECharts** | Dashboard de reportes: donut, barras, línea y **mapa choropleth de Bolivia** |
| **GeoJSON (`/public`)** | Polígonos de los 9 departamentos para el mapa `bolivia` de ECharts |
| **html5-qrcode** | Escáner de códigos **CODE_128** con la cámara (seriales, IMEI, MI ID) |
| **JsBarcode** | Genera el código de barras CODE_128 con el MI ID del usuario (modal "Mi Código") |
| **xlsx / xlsx-js-style** | Lectura de Excels de importación masiva y plantillas descargables con estilos |
| **JSZip** | Edición interna del `.xlsx` para insertar listas desplegables (validaciones de datos) en las plantillas |
| **CSS inline + SVG props** | Sistema visual: degradados azules, tarjetas, modales de confirmación, iconos |

### Roles y control de acceso

| Nivel | Implementación |
|---|---|
| Office Manager | `canAccessManagement` → todas las páginas de gestión |
| City Manager | `canAccessBundles` → bandeos propios + equipo vía `head_in_charge` |
| Field Force | `canAccessDelivery` → Entrega, Compartir y Recibir Bandeos |

---

## Base de datos (MySQL)

| Tabla | Función |
|---|---|
| `user` | Cuentas: `mi_id`, email, `password_hash`, `level_user`, `status`, `failed_attempts`, `locked_until` |
| `user_profile` | Datos personales: nombre, apellido, cargo, fecha nacimiento, ciudad, `head_in_charge`, `profile_picture` |
| `stores` | Tiendas con código, nombre, ciudad y propietario (`user_id`) |
| `project` | Proyectos a los que pertenecen los bandeos |
| `bundle` | Inventario de bandeos: serial, propietario, estado |
| `bundle_model` + `bundle_color` | Catálogo de modelos y colores |
| `smartphones_database` + `smartphone_model` | Inventario de celulares por IMEI y catálogo de modelos |
| `distributor` | Distribuidores de smartphones |
| `transfer_history` | **Auditoría de transferencias**: `bundle_id`, `old_user_id`, `new_user_id`, `manager_user_id` (quién hizo el cambio), `status` (`transfering`/`completed`/`rejected`/`canceled`) |
| `bundle_delivered` | Registro de entregas: cliente, teléfono, foto, tienda, fecha |

---

## Seguridad implementada

- Contraseñas con **bcrypt**
- **Bloqueo de cuenta** tras 5 intentos fallidos hasta el día siguiente (`locked_until`)
- Usuarios inactivos: login rechazado + todas las peticiones con `x-user-id` rechazadas
- Escopado de datos por rol: Office Manager ve todo; City Manager ve su equipo; Field Force solo lo propio

## Diagrama de recursos

```mermaid
flowchart LR
    subgraph Client[Capa 1 — Cliente]
        UI[React Components]
        CAM[Cámara html5-qrcode]
        XL[xlsx Import/Export]
        CH[ECharts + GeoJSON]
    end
    subgraph Server[Capa 2 — Servidor]
        API[Express Routes]
        Z[Zod Validation]
        UP[Multer Uploads]
        REPO[Repositories SQL]
    end
    subgraph Data[Capa 3 — Datos]
        DB[(MySQL)]
        FS[/uploads]
    end
    UI -->|axios x-user-id| API
    API --> Z --> REPO --> DB
    UP --> FS
```
