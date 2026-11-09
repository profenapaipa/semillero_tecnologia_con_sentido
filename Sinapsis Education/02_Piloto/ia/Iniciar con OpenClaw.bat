@echo off
REM Iniciar con OpenClaw.bat: arranca el gateway (si hace falta) y el servidor de Niky con un doble clic.
REM
REM Ninguna clave se escribe aqui. Se guardan una sola vez en el equipo:
REM     token del gateway:  powershell -File guardar-token.ps1
REM     clave de Gemini (opcional, segundo eslabon):  setx GEMINI_API_KEY "la-clave-del-grupo"
REM y se cierra y vuelve a abrir esta ventana. Sin ellas, Niky responde con el respaldo.
REM
REM Que pagina se sirve, en este orden:
REM     1. la carpeta de la variable PUBLICO, si ya esta definida
REM     2. ia\plataforma-congelada\  (la copia que se lleva al segundo computador)
REM     3. la plataforma en Proyectos repositorios Github\mt-exposicion
REM     4. la pagina antigua del piloto (app\public)
REM
REM Para DETENER: cierra las ventanas negras o presiona Ctrl+C dentro de ellas.

cd /d "%~dp0..\app"

where node >nul 2>nul
if errorlevel 1 (
  echo Falta Node.js. Instalalo desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)

if not defined PUBLICO (
  if exist "%~dp0plataforma-congelada\index.html" (
    set "PUBLICO=%~dp0plataforma-congelada"
  ) else if exist "%~dp0..\..\..\Proyectos repositorios Github\mt-exposicion\index.html" (
    set "PUBLICO=%~dp0..\..\..\Proyectos repositorios Github\mt-exposicion"
  )
)

REM Si el gateway ya corre (como servicio o en otra ventana) no se abre un segundo.
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient('127.0.0.1',18789); $c.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo Encendiendo el gateway de OpenClaw en otra ventana...
  start "OpenClaw gateway" cmd /k openclaw gateway run
  echo Esperando 10 segundos a que arranque...
  timeout /t 10 /nobreak >nul
)

start "" "http://127.0.0.1:4310"
node server.js
pause
