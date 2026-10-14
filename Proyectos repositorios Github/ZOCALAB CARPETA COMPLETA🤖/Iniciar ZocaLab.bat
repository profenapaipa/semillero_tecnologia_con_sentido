@echo off
setlocal EnableExtensions
chcp 65001 >nul
title ZocaLab - Servidor
cd /d "%~dp0"

set "PORT=5500"

:: ---------- Verificar Python ----------
set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY (
    python --version >nul 2>&1 && set "PY=python"
)
if not defined PY (
    echo [ERROR] No se encontro Python.
    echo Instalalo desde https://www.python.org/downloads/ y marca "Add Python to PATH".
    echo O bien: winget install Python.Python.3.12
    pause
    exit /b 1
)

if not exist "%~dp0ZocaLab\index.html" (
    echo [ERROR] No se encontro ZocaLab\index.html junto a este archivo.
    pause
    exit /b 1
)
if not exist "%~dp0serve.py" (
    echo [ERROR] Falta serve.py junto a este archivo.
    pause
    exit /b 1
)

:: ---------- IP local ----------
set "IP="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^(127|169\.254)\.' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress"`) do set "IP=%%i"

:MENU
cls
echo ==========================================
echo    ZocaLab - Educacion Ancestral Digital
echo ==========================================
echo.
echo  [1] Desarrollo  (solo este PC, sin cache)
echo  [2] Red local   (accesible desde el celular por WiFi)
echo  [3] Detener servidor en el puerto %PORT%
echo  [4] Salir
echo.
set "OP="
set /p "OP=Elige una opcion: "
if "%OP%"=="1" goto DEV
if "%OP%"=="2" goto LAN
if "%OP%"=="3" goto STOP
if "%OP%"=="4" exit /b 0
goto MENU

:DEV
call :LIBRE || goto MENU
echo.
echo Abriendo http://localhost:%PORT%
start "" "http://localhost:%PORT%/"
%PY% serve.py --host 127.0.0.1 --port %PORT% --nocache
pause
goto MENU

:LAN
call :LIBRE || goto MENU
echo.
echo En este PC:       http://localhost:%PORT%
if defined IP (echo Desde el celular:  http://%IP%:%PORT%) else (echo No se detecto la IP local.)
echo.
echo Si Windows pregunta por el Firewall, permite el acceso en "Redes privadas".
start "" "http://localhost:%PORT%/"
%PY% serve.py --host 0.0.0.0 --port %PORT%
pause
goto MENU

:STOP
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; 'Servidor detenido.' } else { 'No hay ningun servidor en el puerto %PORT%.' }"
pause
goto MENU

:: Devuelve error si el puerto ya esta ocupado
:LIBRE
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
    echo.
    echo El puerto %PORT% ya esta en uso. Usa la opcion 3 para detenerlo.
    pause
    exit /b 1
)
exit /b 0
