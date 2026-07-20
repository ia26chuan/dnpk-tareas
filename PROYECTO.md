# Proyecto DNPK - Control de Tareas Diarias

## Estado Actual
- **Frontend**: React 19 + Vite 8 (dev en localhost:5173)
- **Backend**: Express 4 + Node.js (dev en localhost:5000)
- **DB**: JSON file (data.json), en cloud usa /tmp/data.json
- **Cloud**: Deployed en Render.com - https://dnpk-control-tareas.onrender.com

## Repositorio GitHub
- **URL**: https://github.com/ia26chuan/dnpk-tareas
- **Auto-deploy**: Activado (cada push redeploya)

## Render.com
- **Servicio**: dnpk-control-tareas
- **Dashboard**: https://dashboard.render.com/web/srv-d9e9hff7f7vs73a5bkqg
- **URL**: https://dnpk-control-tareas.onrender.com

## Credenciales App
| Usuario | Email | Contraseña |
|---------|-------|------------|
| Admin | admin@dnpk.com | Dnpk@2026 |
| Juan | juan@dnpk.com | Dnpk@Ju4n |
| María | maria@dnpk.com | Dnpk@M4ria |

## Estructura del Proyecto
```
C:\JP\listatareas\              ← Proyecto local (desarrollo)
C:\JP\listatareas\dnpk-nube\    ← Versión cloud (desplegada en Render)
C:\JP\listatareas.zip           ← ZIP completo
C:\JP\dnpk-nube.zip             ← ZIP para deploy
```

## Para Seguir Desarrollando
1. Editar en `C:\JP\listatareas\` (proyecto local)
2. Copiar cambios a `dnpk-nube/`
3. Git push al repo → auto-deploy en Render
4. `cd frontend && npm run dev` (puerto 5173)
5. `cd backend && node server.js` (puerto 5000)

## Funcionalidades Implementadas
- Login con email (no usuario)
- Dashboard de usuario con tareas por grupo/sector
- Dashboard de admin: usuarios, grupos, tareas, historial
- Modo oscuro/claro con toggle (login, user, admin)
- Logo DNPK en favicon, login y headers
- Cambio de contraseña
- Historial de tareas diarias
- Grupos/sectores con tareas asignadas por grupo

## Modelos de Datos (v2)
- **users**: id, name, email, password, plainPassword, groupId, role
- **groups**: id, name (sectores/departamentos)
- **tasks**: id, groupId, title, description, active
- **taskHistory**: id, userId, date, tasks (array de tareas completadas)

## Importante
- En cloud, data.json se escribe en /tmp/ (Render tiene filesystem read-only)
- Build command: `cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install`
- El flag `--include=dev` es necesario porque NODE_ENV=production omite devDependencies (vite)
