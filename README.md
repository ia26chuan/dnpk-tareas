# Control de Tareas Diarias

Aplicacion web **Mobile-First** para control de tareas de ingreso y egreso de empleados.
Funciona como app nativa desde el navegador en Android e iOS.

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

Para verificar que los tenes instalados:
```bash
node -v
npm -v
```

---

## Credenciales por Defecto

| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| `admin@dnpk.com` | `Dnpk@2026` | Administrador |
| `juan@dnpk.com` | `Dnpk@Ju4n` | Empleado |
| `maria@dnpk.com` | `Dnpk@M4ria` | Empleada |

---

## Estructura del Proyecto

```
listatareas/
├── iniciar.bat              <- Doble clic para iniciar todo (Windows)
├── README.md                <- Este archivo
├── backend/
│   ├── package.json         <- Dependencias del servidor
│   ├── db.js                <- Gestor de base de datos JSON
│   ├── server.js            <- Servidor Express (API REST, puerto 5000)
│   └── data.json            <- Base de datos (auto-generada al primer inicio)
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                    <- Controlador principal + auth + rutas + tema
        ├── index.css                  <- Diseno premium Mobile-First (dark + light)
        ├── api.js                     <- Cliente API centralizado
        ├── main.jsx                   <- Entry point de React
        └── components/
            ├── Login.jsx              <- Pantalla de login
            ├── UserDashboard.jsx      <- Vista del empleado (tareas + progreso)
            └── AdminDashboard.jsx     <- Panel de administrador (3 pestanas)
```

---

## Arquitectura

### Backend
- **Node.js + Express** escuchando en el puerto `5000`
- **Base de datos**: archivo `backend/data.json` (JSON puro, sin SQL)
- **Autenticacion**: JWT (tokens de 30 dias)
- **Contrasenas**: bcrypt (hash seguro)

### Frontend
- **React + Vite** corriendo en el puerto `5173`
- **Diseno**: CSS puro Mobile-First, fuente Inter, tema oscuro premium
- **Persistencia de sesion**: `localStorage` (el usuario no tiene que loguearse de nuevo al abrir)
- **Iconos**: lucide-react
- **Tema**: Modo oscuro/claro con toggle, preferencia guardada en `localStorage`

### API REST

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesion |
| GET | `/api/tasks` | Obtener tareas del usuario logueado |
| POST | `/api/tasks/:id/toggle` | Marcar/desmarcar tarea |
| GET | `/api/admin/users` | Listar usuarios con estadisticas (admin) |
| POST | `/api/admin/users` | Crear usuario (admin) |
| DELETE | `/api/admin/users/:id` | Eliminar usuario (admin) |
| GET | `/api/admin/tasks/:userId` | Tareas de un usuario especifico (admin) |
| POST | `/api/admin/tasks` | Agregar tarea a usuario (admin) |
| PUT | `/api/admin/tasks/:id` | Editar tarea (admin) |
| DELETE | `/api/admin/tasks/:id` | Eliminar tarea (admin) |
| POST | `/api/admin/users/:id/reset` | Reiniciar jornada de usuario (admin) |

---

## Funcionalidades

### Vista Empleado
- Lista de **Tareas de Entrada** (visibles desde el inicio)
- Lista de **Tareas de Salida** (bloqueada hasta completar todas las de entrada)
- Barra de progreso diaria
- Fecha del dia visible en el perfil
- Pantalla de exito al completar toda la jornada
- Estado persistente (si se cierra el navegador, todo se recupera)
- **Toggle modo oscuro/claro** (guarda preferencia)

### Panel Administrador
- **Monitoreo**: Estado en tiempo real de cada empleado con horarios de completado
- **Usuarios**: Crear y eliminar empleados
- **Tareas**: Agregar/eliminar tareas de entrada y salida por usuario
- **Reinicio**: Boton para resetear la jornada de cualquier empleado
- **Toggle modo oscuro/claro** (guarda preferencia)

---

## Acceso desde Movil (Red Local)

1. Inicia el frontend con:
   ```bash
   cd frontend
   npm run dev -- --host
   ```
2. Vite mostrara algo como: `Network: http://192.168.X.X:5173/`
3. Abre esa URL desde tu celular conectado a la misma red WiFi.

---

## Configuracion de Puerto del Backend

Si el puerto `5000` esta ocupado, edita `backend/server.js`:
```js
const PORT = process.env.PORT || 5000;  // <- Cambia 5000 por otro numero
```
Y actualiza las llamadas en los componentes del frontend (buscar `localhost:5000`).

---

## Llevar a Otra PC

1. Copia toda la carpeta `listatareas/`
2. Borra las carpetas `node_modules` de `backend/` y `frontend/` (son pesadas, se regeneran)
3. En la nueva PC ejecuta `iniciar.bat` o instala manualmente con `npm install` en cada carpeta

> **Nota**: El archivo `data.json` contiene todos los usuarios y tareas. Si queres empezar desde cero en la nueva PC, borra `backend/data.json` antes de iniciar — se generara automaticamente con los datos de ejemplo.
