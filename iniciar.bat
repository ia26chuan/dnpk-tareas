@echo off
title Control de Tareas Diarias
color 0A
echo.
echo  ============================================
echo    Control de Tareas Diarias - Iniciando...
echo  ============================================
echo.

:: Verificar que Node.js este instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargalo desde: https://nodejs.org/
    pause
    exit /b 1
)

:: Detectar IP Local usando PowerShell
set LOCAL_IP=localhost
for /f "tokens=*" %%i in ('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress -First 1)"') do set LOCAL_IP=%%i

:: Instalar dependencias del backend si no existen
if not exist "backend\node_modules" (
    echo  [1/3] Instalando dependencias del backend...
    cd backend
    call npm install --silent
    cd ..
) else (
    echo  [1/3] Backend: dependencias ya instaladas.
)

:: Instalar dependencias del frontend si no existen
if not exist "frontend\node_modules" (
    echo  [2/3] Instalando dependencias del frontend...
    cd frontend
    call npm install --silent
    cd ..
) else (
    echo  [2/3] Frontend: dependencias ya instaladas.
)

:: Compilar el frontend (React) para que Express lo sirva
echo  [3/3] Compilando la aplicacion frontend (React)...
cd frontend
call npm run build
cd ..

echo.
echo  [+] Iniciando el servidor unificado en el puerto 5000...
start "Servidor - Control de Tareas" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo.
echo  ==============================================================
echo    APLICACION INICIADA CORRECTAMENTE!
echo  ==============================================================
echo.
echo   [PC Local]:     http://localhost:5000/
echo.
echo   [Celulares]:    http://%LOCAL_IP%:5000/
echo.
echo   * Para conectar celulares, deben estar en la misma red WiFi
echo     que esta computadora.
echo.
echo   Credenciales:
echo     - Administrador:  admin@dnpk.com / Dnpk@2026
echo     - Empleados:      juan@dnpk.com / Dnpk@Ju4n
echo                       maria@dnpk.com / Dnpk@M4ria
echo.
echo  ==============================================================
echo.
echo   Presiona cualquier tecla para abrir la aplicacion en la PC...
pause >nul

start http://localhost:5000/

