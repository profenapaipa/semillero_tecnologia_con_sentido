@echo off
REM Iniciar Wisfox.bat — arranca el servidor de desarrollo con un doble clic
REM ============================================================================
REM Que hace:
REM   1. Se ubica en la carpeta del proyecto (donde esta este archivo).
REM   2. Si es la primera vez (no existe node_modules), instala las
REM      dependencias con "npm install".
REM   3. Abre una ventana nueva con el servidor de desarrollo (npm run dev).
REM   4. Espera unos segundos y abre el navegador en http://localhost:5173.
REM
REM Para DETENER la app: cierra la ventana negra "Wisfox - servidor de
REM desarrollo" que se abre (o presiona Ctrl+C dentro de ella).
REM
REM Requisito: tener Node.js instalado (node y npm disponibles en el PATH).

cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias por primera vez, esto puede tardar un poco...
  call npm install
  if errorlevel 1 (
    echo.
    echo Hubo un error instalando las dependencias. Revisa el mensaje de arriba.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando Wisfox...
echo La app se abrira sola en http://localhost:5173
echo.

start "Wisfox - servidor de desarrollo" cmd /k npm run dev

timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
