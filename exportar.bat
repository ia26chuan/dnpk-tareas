@echo off
title Comprimir proyecto para exportar
echo.
echo  Comprimiendo proyecto (sin node_modules)...
echo.

:: Crear zip usando PowerShell
powershell -Command "Compress-Archive -Path '%~dp0backend\package.json', '%~dp0backend\package-lock.json', '%~dp0backend\db.js', '%~dp0backend\server.js', '%~dp0backend\data.json', '%~dp0backend\.env', '%~dp0frontend\src', '%~dp0frontend\index.html', '%~dp0frontend\vite.config.js', '%~dp0frontend\package.json', '%~dp0frontend\package-lock.json', '%~dp0README.md', '%~dp0README-DEPLOY.md', '%~dp0PROYECTO.md', '%~dp0render.yaml', '%~dp0build.sh', '%~dp0info.txt', '%~dp0DNPK.png', '%~dp0iniciar.bat', '%~dp0exportar.bat', '%~dp0.gitignore' -DestinationPath '%~dp0listatareas_exportar.zip' -Force"

echo.
if exist "%~dp0listatareas_exportar.zip" (
    echo  [OK] Archivo creado: listatareas_exportar.zip
    echo.
    echo  Para usar en otra PC:
    echo  1. Copiar listatareas_exportar.zip
    echo  2. Extraer en cualquier carpeta
    echo  3. Ejecutar iniciar.bat
) else (
    echo  [ERROR] No se pudo crear el archivo ZIP
)
echo.
pause
