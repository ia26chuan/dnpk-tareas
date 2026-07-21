# DNPK - Control de Tareas Diarias

Aplicacion web **Mobile-First** (PWA) para control de tareas de ingreso y egreso de empleados.
Funciona como app nativa desde el navegador en Android e iOS.

**Cloud**: https://dnpk-control-tareas.onrender.com
**GitHub**: https://github.com/ia26chuan/dnpk-tareas

---

## Inicio Rapido

### En Windows (doble clic)
Ejecuta el archivo `iniciar.bat` en la raiz del proyecto.

### Manual (2 terminales)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Luego abre: **http://localhost:5173/**

---

## Requisitos

- **Node.js** v18 o superior -> https://nodejs.org/
- **npm** (incluido con Node.js)

---

## Credenciales

| Email | Contrasena | Rol |
|-------|-----------|-----|
| `admin@dnpk.com` | `Dnpk@2026` | Administrador |
| `coo@dnpk.com` | `Coo@2026` | Coordinador |
| `juan@dnpk.com` | `Dnpk@Ju4n` | Empleado |
| `maria@dnpk.com` | `Dnpk@M4ria` | Empleada |

---

## Roles

### Administrador
- Monitorea TODOS los usuarios en tiempo real
- Administra usuarios (crear, eliminar, cambiar contrasena, asignar grupo)
- Administra grupos/sectores y tareas
- Historial por fecha de todos los usuarios
- Solo 1 admin permitido

### Coordinador
- Ve SUS tareas de ingreso/egreso (como empleado)
- Monitorea TODOS los usuarios (excepto admins y otros coordinadores)
- Historial por fecha de todos los usuarios
- Asignado a un grupo/sector

### Empleado (User)
- Ve tareas de su grupo/sector
- Tareas de ingreso visibles, tareas de egreso bloqueadas hasta completar ingreso
- Historial propio
- Cambio de contrasena

---

## Funcionalidades

### Vista Empleado
- Lista de **Tareas de Entrada** (visibles desde el inicio)
- Lista de **Tareas de Salida** (bloqueada hasta completar todas las de entrada)
- Barra de progreso diaria
- Historial propio
- Cambio de contrasena
- **Toggle modo oscuro/claro** (guarda preferencia)

### Panel Coordinador
- Sus propias tareas (ingreso/egreso con lock)
- Monitor: todos los usuarios activos con estado y horarios
- Historial por fecha con date picker

### Panel Administrador
- **Monitor**: Estado en tiempo real de cada empleado con horarios de completado
- **Grupos**: Crear, renombrar, eliminar grupos/sectores con tareas
- **Usuarios**: Crear, eliminar, cambiar contrasena, asignar grupo
- **Historial**: Buscar por fecha, ver estado de cada usuario
- **Reinicio**: Resetear jornada de usuario
- **Reset DB**: Reiniciar base de datos completa
- **Toggle modo oscuro/claro** (guarda preferencia)

---

## Estructura del Proyecto

```
listatareas/
├── iniciar.bat                    <- Doble clic para iniciar todo (Windows)
├── README.md                      <- Este archivo
├── backend/
│   ├── package.json               <- Dependencias del servidor
│   ├── db.js                      <- Gestor de base de datos JSON
│   ├── server.js                  <- Servidor Express (API REST, puerto 5000)
│   ├── data.json                  <- Base de datos
│   ├── backend/.env               <- JWT_SECRET
│   └── public/                    <- Frontend buildeado (para deploy)
└── frontend/
    ├── index.html
    ├── vite.config.js             <- Dev proxy + build output
    └── src/
        ├── App.jsx                <- Controlador principal + auth + rutas + tema
        ├── index.css              <- Diseno Mobile-First (dark + light)
        ├── api.js                 <- Cliente API centralizado
        ├── main.jsx               <- Entry point de React
        └── components/
            ├── Login.jsx          <- Pantalla de login con eye icons
            ├── UserDashboard.jsx  <- Vista del empleado
            ├── AdminDashboard.jsx <- Panel admin (Monitor/Grupos/Users/Historial)
            └── CoordinatorDashboard.jsx <- Panel coordinador
```

---

## Arquitectura

### Backend
- **Node.js + Express** en puerto `5000`
- **DB**: JSON file (`data.json`), en cloud `/tmp/data.json` (Render read-only)
- **Auth**: JWT (tokens de 30 dias)
- **Pass**: bcrypt (hash) + plainPassword para UX admin
- **Seed**: Auto-genera usuarios y tareas de ejemplo

### Frontend
- **React 19 + Vite 8** en puerto `5173`
- **CSS puro** Mobile-First, fuente Inter
- **Tema**: Dark/Light toggle, guardado en localStorage
- **PWA**: manifest.json, iconos, standalone mode
- **Iconos**: lucide-react

---

## API REST

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/tasks` | Tareas del usuario |
| POST | `/api/tasks/:id/toggle` | Marcar/desmarcar tarea |
| GET | `/api/tasks/history` | Historial del usuario |
| GET | `/api/tasks/history/date?date=` | Tareas por fecha |
| POST | `/api/tasks/change-password` | Cambiar contrasena |
| GET | `/api/admin/users` | Listar usuarios (admin) |
| POST | `/api/admin/users` | Crear usuario (admin) |
| DELETE | `/api/admin/users/:id` | Eliminar usuario (admin) |
| PUT | `/api/admin/users/:id/password` | Cambiar pass (admin) |
| PUT | `/api/admin/users/:id/group` | Asignar grupo (admin) |
| GET | `/api/admin/tasks/:userId` | Tareas de usuario (admin) |
| POST | `/api/admin/tasks` | Crear tarea (admin) |
| PUT | `/api/admin/tasks/:id` | Editar tarea (admin) |
| DELETE | `/api/admin/tasks/:id` | Eliminar tarea (admin) |
| POST | `/api/admin/users/:id/reset` | Resetear jornada (admin) |
| POST | `/api/admin/reset-db` | Resetear DB completa (admin) |
| GET | `/api/admin/groups` | Listar grupos (admin) |
| POST | `/api/admin/groups` | Crear grupo (admin) |
| PUT | `/api/admin/groups/:id` | Renombrar grupo (admin) |
| DELETE | `/api/admin/groups/:id` | Eliminar grupo (admin) |
| GET | `/api/admin/history/date?date=` | Historial por fecha (admin) |
| GET | `/api/coordinator/monitor` | Monitor coordinador |
| GET | `/api/coordinator/history/date?date=` | Historial coordinador |

---

## Llevar a Otra PC

1. Copia la carpeta completa `listatareas/`
2. Borra `node_modules` de `backend/` y `frontend/`
3. En la nueva PC: ejecuta `iniciar.bat` o `npm install` en cada carpeta

---

## Deploy Cloud (Render.com)

1. Push a GitHub repo
2. En Render: Manual Deploy > Deploy latest commit
3. Variables de entorno: `JWT_SECRET`, `NODE_ENV=production`

Ver `dnpk-nube/README-DEPLOY.md` para guia completa.
