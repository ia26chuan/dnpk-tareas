# Deploy a la Nube - Control de Tareas DNPK

Guia para subir la aplicacion a la nube y que funcione 24/7 sin servidor local.

## Opcion 1: Render (GRATIS, recomendado)

### Paso 1: Crear cuenta en GitHub
1. Ir a https://github.com
2. Crear cuenta gratuita
3. Crear un repositorio nuevo llamado `dnpk-tareas`

### Paso 2: Subir el codigo a GitHub
1. Descargar e instalar GitHub Desktop: https://desktop.github.com
2. Clonar el repositorio creado
3. Copiar TODO el contenido de la carpeta `dnpk-nube/` dentro del repositorio
4. Hacer commit y push

### Paso 3: Crear cuenta en Render
1. Ir a https://render.com
2. Crear cuenta con GitHub (boton "Get Started for Free")

### Paso 4: Crear el servicio
1. Dashboard > New > Web Service
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Name**: dnpk-tareas
   - **Runtime**: Node
   - **Build Command**: `cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Free
4. Crear variable de entorno:
   - **Key**: JWT_SECRET
   - **Value**: (generar uno seguro, ej: `mi-clave-secreta-2026-dnpk`)
5. Click "Create Web Service"

### Paso 5: Esperar el deploy
- Render tarda 2-5 minutos en instalar y compilar
- Una vez listo, muestra una URL como: `https://dnpk-tareas.onrender.com`
- Esa URL funciona 24/7 desde cualquier dispositivo

### Credenciales:
| Email | Contrasena |
|-------|-----------|
| admin@dnpk.com | Dnpk@2026 |
| juan@dnpk.com | Dnpk@Ju4n |
| maria@dnpk.com | Dnpk@M4ria |

---

## Opcion 2: Railway (GRATIS con limites)

1. Ir a https://railway.app
2. Crear cuenta con GitHub
3. New Project > Deploy from GitHub repo
4. Seleccionar el repositorio
5. Railway detecta automaticamente Node.js
6. Agregar variable de entorno: JWT_SECRET = (tu clave)
7. Deploy automatico

---

## Opcion 3: Fly.io (GRATIS con limites)

1. Instalar flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. Ejecutar `fly launch` en la carpeta del proyecto
3. Seguir las instrucciones en pantalla

---

## Notas importantes

- **Datos**: En la nube, los datos se guardan en un archivo JSON en el servidor. Si el servidor se reinicia, los datos se mantienen.
- **Gratis**: Render free tier duerme despues de 15 min de inactividad, se despierta solo al recibir una peticion (tarda ~30 seg).
- **Dominio personalizado**: Se puede agregar un dominio propio en la configuracion de Render.
- **HTTPS**: automatico en todos los hosting gratuitos.
- **Actualizaciones**: Al hacer push a GitHub, Render redeploya automaticamente.

## Estructura de archivos para subir a GitHub

```
dnpk-tareas/
├── package.json          (archivo raiz)
├── render.yaml           (configuracion Render)
├── README.md             (este archivo)
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── package-lock.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api.js
        ├── assets/
        └── components/
```
