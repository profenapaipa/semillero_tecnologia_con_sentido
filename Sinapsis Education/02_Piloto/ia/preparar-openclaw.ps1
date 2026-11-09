# preparar-openclaw.ps1: deja OpenClaw listo para que el piloto converse con Niky.
#
# Uso (en Windows PowerShell, con el gateway ya encendido en OTRA ventana: `openclaw gateway run`):
#     .\preparar-openclaw.ps1 -Modelo "google/<id>"
# El id sale de:  openclaw models list --provider google
# No se adivina el id porque el catálogo cambia entre versiones.
#
# Qué hace, en este orden:
#   1. Crea el agente "niky" con un workspace propio FUERA del repositorio. OpenClaw escribe
#      archivos de arranque en el workspace y no deben terminar en un commit.
#   2. Activa el endpoint /v1/chat/completions del gateway (apagado por defecto).
#   3. Le quita a niky todas las herramientas: solo conversa.
#   4. Apaga la inyección de archivos de contexto en niky. La personalidad llega en cada petición
#      desde server.js; así cada turno es más corto y más rápido, y ningún archivo de arranque
#      puede desviar las respuestas.
# Cada cambio se valida primero con --dry-run: si el esquema de esta versión lo rechaza, el
# script se detiene sin escribir nada de ese paso.
#
# No toca ninguna clave. La clave de Gemini se guarda con:
#     openclaw models auth paste-api-key --provider google
# y el token del gateway con guardar-token.ps1.

param(
  [Parameter(Mandatory = $true)][string]$Modelo
)

$ErrorActionPreference = 'Stop'
$Agente = 'niky'
$Aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$Workspace = Join-Path $env:USERPROFILE '.openclaw\workspace-niky'

function Limpio($texto) { ($texto | Out-String) -replace '\x1b\[[0-9;]*m', '' }

if ($Modelo -notmatch '^[\w.-]+/[\w.:-]+$') {
  throw "El modelo debe verse como proveedor/id, por ejemplo google/gemini-... Recibí: $Modelo"
}

# Sin gateway no se puede crear el agente (la documentación dice que `agents add` lo usa).
$cliente = New-Object System.Net.Sockets.TcpClient
$conecta = $false
try {
  $espera = $cliente.BeginConnect('127.0.0.1', 18789, $null, $null)
  $conecta = $espera.AsyncWaitHandle.WaitOne(1500) -and $cliente.Connected
} catch { $conecta = $false } finally { $cliente.Close() }
if (-not $conecta) {
  throw 'El gateway no responde en 127.0.0.1:18789. Abre otra ventana de PowerShell y corre: openclaw gateway run'
}

Write-Host '1/4 Workspace y agente' -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $Workspace | Out-Null
Copy-Item -Force (Join-Path $Aqui 'niky-workspace\AGENTS.md') (Join-Path $Workspace 'AGENTS.md')
$lista = Limpio (openclaw agents list 2>&1)
if ($lista -match "(?m)^- $Agente\b") {
  Write-Host "    El agente $Agente ya existe: se conserva."
} else {
  Limpio (openclaw agents add $Agente --non-interactive --workspace $Workspace --model $Modelo 2>&1) | Write-Host
}

function Fijar($ruta, $valorJson) {
  $prueba = Limpio (openclaw config set $ruta $valorJson --strict-json --dry-run 2>&1)
  if ($prueba -notmatch 'Dry run successful') {
    throw "OpenClaw rechazó $ruta :`n$prueba"
  }
  Limpio (openclaw config set $ruta $valorJson --strict-json 2>&1) | Write-Host
}

Write-Host '2/4 Endpoint compatible con OpenAI' -ForegroundColor Cyan
Fijar 'gateway.http.endpoints.chatCompletions.enabled' 'true'

Write-Host '3/4 Sin herramientas' -ForegroundColor Cyan
# Grupos y herramientas según docs.openclaw.ai/gateway/config-tools/tool-policy. "deny" gana
# sobre cualquier permiso. No existe un perfil de cero herramientas; por eso se niegan todos los grupos.
$negadas = '["group:runtime","group:fs","group:web","group:ui","group:automation","group:messaging","group:nodes","group:sessions","group:memory","group:media","group:agents","group:openclaw","group:plugins","bundle-mcp","session_status","gateway","cron"]'
Fijar "agents.entries.$Agente.tools.deny" $negadas

Write-Host '4/4 Sin archivos de contexto' -ForegroundColor Cyan
Fijar "agents.entries.$Agente.contextInjection" '"never"'

Write-Host ''
Write-Host 'Listo. Falta reiniciar el gateway para que tome el cambio del endpoint:' -ForegroundColor Green
Write-Host '  1. En la ventana del gateway presiona Ctrl+C y vuelve a correr: openclaw gateway run'
Write-Host '  2. Guarda el token con .\guardar-token.ps1 (una sola vez)'
Write-Host '  3. Abre una ventana NUEVA y corre: node probar-en-vivo.mjs'
Write-Host ''
Write-Host 'Lo que quedó guardado para niky:'
Limpio (openclaw config get "agents.entries.$Agente" 2>&1) | Write-Host
