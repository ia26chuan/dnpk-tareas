# Deploy a la Nube - Control de Tareas DNPK

Guia para subir la aplicacion a la nube y que funcione 24/7 sin servidor local.

---

## Estado Actual del Deploy
- **URL**: https://dnpk-control-tareas.onrender.com
- **Servicio**: dnpk-control-tareas en Render.com
- **Auto-deploy**: DESACTIVADO — usar Manual Deploy
- **Repo GitHub**: https://github.com/ia26chuan/dnpk-tareas

---

## Como Deployar (Manual)

1. Hacer cambios en el proyecto local
2. Copiar cambios a `dnpk-nube/`
3. Push a GitHub:
   ```bash
   cd dnpk-nube
   git add -A
   git commit -m "Descripcion del cambio"
   git push
   ```
4. Ir a https://dashboard.render.com
5. Seleccionar **dnpk-control-tareas**
6. Pestaña **Manual Deploy** → **Deploy latest commit**
7. Esperar ~1-2 minutos

---

## Credenciales

| Email | Contrasena | Rol |
|-------|-----------|-----|
| admin@dnpk.com | Dnpk@2026 | Administrador |
| coo@dnpk.com | Coo@2026 | Coordinador |
| juan@dnpk.com | Dnpk@Ju4n | Empleado |
| maria@dnpk.com | Dnpk@M4ria | Empleada |

---

## Configuracion Render

- **Runtime**: Node
- **Plan**: Free
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && node server.js`
- **Variables de entorno**:
  - `NODE_ENV` = production
  - `JWT_SECRET` = (auto-generado)

---

## Notas Importantes

- En cloud, `data.json` se escribe en `/tmp/` (Render read-only)
- Frontend pre-buildeado en `backend/public` (no necesita rebuild en deploy)
- Render free tier duerme despues de 15 min de inactividad (~30s al despertar)
- HTTPS automatico
- Solo 1 admin permitido (enforced backend)

---

## Troubleshooting

### El deploy no toma los ultimos cambios
- Verificar que el push a GitHub fue exitoso
- En Render: Manual Deploy > Deploy latest commit

### Error de Build
- Verificar que `dnpk-nube/backend/public/` tiene los assets buildeados
- Verificar que `dnpk-nube/backend/package.json` tiene todas las dependencias

### Datos perdidos en cloud
- Render reinicia el servicio periodicamente
- `/tmp/data.json` se mantiene entre requests pero se pierde si el servicio se re-despliega
- Los datos de seed se regeneran automaticamente
