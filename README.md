# Semana 11 – Desarrollo Backend (Node.js + SQL Server + MongoDB)

Aplicación de gestión de usuarios con APIs RESTful, según la *Guía Práctica Semana 11*:

- **SQL Server**: datos transaccionales (tabla `Users`).
- **MongoDB**: usuarios (versión Mongoose de la guía) y **registro histórico de eventos** (logs) de todas las operaciones CRUD sobre esos usuarios.
- **Express**: rutas y controladores separados por recurso/base de datos.

## Estructura

```
SEMANA11/
├── config/db.js                 # Conexión a SQL Server (mssql) y MongoDB (mongoose)
├── database/script.sql          # Crea la BD miapp_sql y la tabla Users
├── public/                      # Interfaz web (index.html, style.css, app.js)
├── src/
│   ├── controllers/             # userController.js (SQL + Mongo), eventController.js
│   ├── models/                  # user.js, event.js (esquemas Mongoose)
│   ├── routes/                  # userRoutes.js, userMongoRoutes.js, eventRoutes.js
│   ├── services/                # userService.js (consultas SQL), eventService.js (logs)
│   └── utils/validators.js      # Validación de datos de entrada
├── api.http                     # Pruebas de la API con la extensión REST Client
├── server.js                    # Entrada principal del servidor
├── .env.example                 # Variables de entorno de ejemplo
└── package.json
```

## Instalación y ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear la base de datos en SQL Server ejecutando `database/script.sql`
   (SSMS, Azure Data Studio o la extensión *SQL Server (mssql)* de VS Code).
3. Editar `.env` con el usuario y la contraseña de tu SQL Server.
4. Verificar que MongoDB esté corriendo en `mongodb://localhost:27017`.
   Opcional: cargar datos de ejemplo con `npm run seed:mongo` (borra y recarga `users` y `events`).
5. Iniciar el servidor:
   ```bash
   npm run dev     # con recarga automática
   # o
   npm start
   ```
6. Abrir http://localhost:3000 (interfaz web) o usar `api.http` para probar cada endpoint.

## Endpoints

| Método | Ruta                     | Descripción                           |
|--------|--------------------------|---------------------------------------|
| GET    | `/api/health`            | Estado de conexión con ambas BD       |
| POST   | `/api/users`             | Crear usuario (SQL Server)            |
| GET    | `/api/users`             | Listar usuarios (SQL Server)          |
| GET    | `/api/users/:id`         | Obtener usuario (SQL Server)          |
| PUT    | `/api/users/:id`         | Actualizar usuario (SQL Server)       |
| DELETE | `/api/users/:id`         | Eliminar usuario (SQL Server)         |
| POST   | `/api/mongo/users`       | Crear usuario (MongoDB)               |
| GET    | `/api/mongo/users`       | Listar usuarios (MongoDB)             |
| GET    | `/api/mongo/users/:id`   | Obtener usuario (MongoDB)             |
| PUT    | `/api/mongo/users/:id`   | Actualizar usuario (MongoDB)          |
| DELETE | `/api/mongo/users/:id`   | Eliminar usuario (MongoDB)            |
| POST   | `/api/events`            | Crear evento                          |
| GET    | `/api/events?userId=`    | Listar eventos (filtro opcional)      |
| GET    | `/api/events/:id`        | Obtener evento                        |
| PUT    | `/api/events/:id`        | Actualizar evento                     |
| DELETE | `/api/events/:id`        | Eliminar evento                       |

Los eventos (logs) se registran **solo en MongoDB** y **solo para los usuarios de MongoDB**, en todas las operaciones CRUD:

| Operación                       | Evento        |
|---------------------------------|---------------|
| Crear usuario                   | `CREATE_USER` |
| Listar usuarios                 | `READ_USERS`  |
| Consultar un usuario            | `READ_USER`   |
| Actualizar usuario              | `UPDATE_USER` (guarda valor anterior -> valor nuevo) |
| Eliminar usuario                | `DELETE_USER` |

Las operaciones en SQL Server no generan eventos.

## Mejoras respecto al código de la guía

Siguiendo la sección *Consideraciones de seguridad* de la guía:

- **Consultas parametrizadas** (`request.input(...)`) en lugar de concatenar `'${name}'` en el SQL,
  lo que evita **inyección SQL**.
- **Validación de datos** (nombre, email e id) antes de tocar la base de datos.
- **Credenciales en `.env`** (excluido en `.gitignore`) en vez de escribirlas en el código.
- Respuestas JSON con códigos HTTP adecuados (400, 404, 409, 500).
- La interfaz web usa `textContent` al pintar datos para evitar **XSS**.
- Se quitaron las opciones `useNewUrlParser` / `useUnifiedTopology`, obsoletas en Mongoose 6+.
