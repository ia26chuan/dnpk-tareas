# Proyecto DNPK - Control de Tareas Diarias

## Estado Actual
- **Frontend**: React 19 + Vite 8 (dev en localhost:5173)
- **Backend**: Express 4 + Node.js (dev en localhost:5000)
- **DB**: JSON file (data.json), en cloud usa /tmp/data.json
- **Cloud**: Deployed en Render.com - https://dnpk-control-tareas.onrender.com

## Repositorio GitHub
- **URL**: https://github.com/ia26chuan/dnpk-tareas
- **Auto-deploy**: DESACTIVADO (usar Manual Deploy en Render dashboard)

## Render.com
- **Servicio**: dnpk-control-tareas
- **Dashboard**: https://dashboard.render.com/web/srv-d9e9hff7f7vs73a5bkqg
- **URL**: https://dnpk-control-tareas.onrender.com
- **Build**: `cd backend && npm install` (usa backend/public pre-buildeado)
- **Start**: `cd backend && node server.js`

## Credenciales App

| Email | Contrasena | Rol |
|-------|-----------|-----|
| admin@dnpk.com | Dnpk@2026 | Administrador |
| coo@dnpk.com | Coo@2026 | Coordinador |
| juan@dnpk.com | Dnpk@Ju4n | Empleado |
| maria@dnpk.com | Dnpk@M4ria | Empleada |

## Roles
- **Admin** (1 solo): Monitor total, CRUD usuarios/grupos/tareas, historial, reset DB
- **Coordinator**: Sus tareas + monitor de todos los usuarios (sin admins/otros coords)
- **User**: Tareas de su grupo, historial propio, cambio de pass

## Grupos/Workers (data.json)
- `grupo-deposito` → DEPOSITO
- `grupo_1784441100477_nwioj` → BARRA
- `grupo_1784523811927_smxpa` → COORDINADORES

## Estructura del Proyecto
```
listatareas/
├── iniciar.bat                    <- Doble clic para iniciar todo (Windows)
├── README.md                      <- Documentacion principal
├── backend/
│   ├── package.json               <- Dependencias del servidor
│   ├── db.js                      <- Gestor de base de datos JSON
│   ├── server.js                  <- Servidor Express (API REST, puerto 5000)
│   ├── data.json                  <- Base de datos
│   ├── backend/.env               <- JWT_SECRET
│   └── public/                    <- Frontend buildeado (para deploy)
├── frontend/
│   ├── index.html
│   ├── vite.config.js             <- Dev proxy + build output
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── api.js
│       ├── main.jsx
│       └── components/
│           ├── Login.jsx
│           ├── UserDashboard.jsx
│           ├── AdminDashboard.jsx
│           └── CoordinatorDashboard.jsx
└── dnpk-nube/                     ← Copia para deploy en Render
    ├── render.yaml
    ├── backend/ (pre-buildeado)
    └── frontend/src/
```

## Modelos de Datos
- **users**: id, username, passwordHash, plainPassword, role, groupId
- **groups**: id, name
- **tasks**: id, groupId, text, type (entrada/salida), order
- **taskHistory**: id, userId, date, tasks[] (completed, completedAt)

## Para Seguir Desarrollando
1. Editar en `listatareas/` (proyecto local)
2. Los cambios se reflejan en `npm run dev` (hot reload)
3. Cuando este listo: `npm run build` y copiar a `dnpk-nube/`
4. Push a GitHub
5. Manual Deploy en Render dashboard

## Para Llevar a Otra PC
1. Copiar carpeta `listatareas/` completa
2. Borrar `node_modules` de backend/ y frontend/
3. Ejecutar `iniciar.bat` o `npm install` en cada carpeta
4. El `data.json` se auto-genera con datos de ejemplo

## Importante
- En cloud, data.json se escribe en /tmp/ (Render filesystem read-only)
- `render.yaml` usa: buildCommand: `cd backend && npm install`
- Frontend pre-buildeado en `backend/public` (no necesita rebuild en deploy)
- Solo 1 admin permitido (enforced backend)
