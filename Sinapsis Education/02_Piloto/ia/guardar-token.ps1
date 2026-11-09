# guardar-token.ps1: guarda el token del gateway de OpenClaw como variable de entorno del usuario.
#
# Por qué: server.js lee OPENCLAW_GATEWAY_TOKEN del entorno y no de un archivo, igual que la clave de
# Gemini. Así el token nunca está en el repositorio ni se proyecta en pantalla durante la mesa.
# Se corre una sola vez; después hay que cerrar y volver a abrir las ventanas de terminal.
#
# Cómo conseguir el token: en una ventana de PowerShell normal (no redirigida) corre
#     openclaw gateway auth-token --show
# Ese comando se niega a imprimir si la salida va a un archivo o a una tubería, por eso el token
# se copia a mano y se pega aquí. Al pegarlo no se ve en pantalla.

$seguro = Read-Host 'Pega el token del gateway' -AsSecureString
$puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
try {
  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero)
}
if ([string]::IsNullOrWhiteSpace($token)) { throw 'No pegaste nada.' }

setx OPENCLAW_GATEWAY_TOKEN $token | Out-Null
$token = $null
Write-Host 'Guardado. Cierra y vuelve a abrir tus ventanas de terminal para que lo vean.' -ForegroundColor Green
