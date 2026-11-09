# Niky con OpenClaw: cómo dejarlo funcionando

Este es el orden para tu computador. Ninguna clave se escribe en un archivo ni en un chat.

La cadena de respuesta es **OpenClaw, luego Gemini directo (si hay clave), luego `app/public/respaldo.json`**. Cada respuesta dice de dónde vino en el campo `fuente` (`openclaw`, `gemini` o `respaldo`).

## Una sola vez

**1. Conecta OpenClaw con Gemini** (solo tú, con la clave de AI Studio):

```
openclaw onboard --auth-choice gemini-api-key
```

Pega la clave cuando la pida. Omite canales, skills y hooks. Si el asistente ya se cortó antes, también sirve guardar solo la clave:

```
openclaw models auth paste-api-key --provider google
```

**2. Enciende el gateway** en una ventana de PowerShell y déjala abierta:

```
openclaw gateway run
```

**3. Mira qué modelos de Google hay** y elige uno rápido (tipo Flash), no el más grande:

```
openclaw models list --provider google --refresh
```

**4. Prepara el agente `niky`** en otra ventana, con el id que elegiste:

```
cd "<esta carpeta>"
.\preparar-openclaw.ps1 -Modelo "google/<id>"
```

Crea el agente con un workspace fuera del repositorio, activa el endpoint `/v1/chat/completions`, le quita todas las herramientas y apaga los archivos de contexto. Cada cambio se valida antes con `--dry-run`.

**5. Reinicia el gateway** (Ctrl+C en su ventana y `openclaw gateway run`), porque el endpoint nuevo lo toma al arrancar.

**6. Guarda el token del gateway** para que el servidor lo lea del entorno:

```
openclaw gateway auth-token --show
.\guardar-token.ps1
```

El primer comando muestra el token una vez. Cópialo y pégalo en el segundo, que no lo muestra. Luego cierra y abre las ventanas de terminal.

**7. (Opcional) Segundo eslabón.** Si quieres que Niky siga en vivo cuando OpenClaw falle pero haya internet:

```
setx GEMINI_API_KEY "la-clave-del-grupo"
```

## Cada vez que ensayes o presentes

Doble clic en **`Iniciar con OpenClaw.bat`**. Enciende el gateway si no está corriendo, abre el navegador y arranca el servidor. En la ventana negra se lee la cadena activa, por ejemplo `OpenClaw (agente niky) listo -> respaldo`.

## Comprobar que todo está bien

```
node probar-en-vivo.mjs --completo
```

Pide una respuesta por cada rol, mide el tiempo, comprueba que cada petición sea independiente y que Niky no tenga herramientas. Si sale algún `✖`, no uses ese montaje en la mesa.

Sin gateway y sin claves se puede verificar la lógica de la cadena:

```
node --test pruebas/
```

## Qué está verificado y qué no

| Punto | Estado |
|---|---|
| Endpoint `POST /v1/chat/completions`, apagado por defecto, sin estado por petición si no se envía `user` | Leído en la documentación oficial |
| Claves `gateway.http.endpoints.chatCompletions.enabled` y `agents.entries.<id>.tools.deny` | Validadas con `--dry-run` en OpenClaw 2026.11.1 |
| Cadena, recorte de texto, respaldo, token que no sale del equipo | Probado con un OpenClaw simulado (13 pruebas) |
| Que el agente de verdad no tenga herramientas | **Sin verificar.** La documentación no ofrece un comando que liste las herramientas efectivas; `probar-en-vivo.mjs` lo comprueba por comportamiento |
| Que `contextInjection: never` rija en los turnos del gateway | **Sin verificar.** La documentación lo describe para el runtime embebido. Si las respuestas salen raras, quítalo con `openclaw config unset agents.entries.niky.contextInjection` |
| Que el gateway acepte el mensaje `system` | **Sin verificar.** Si no lo respeta, la persona llega igual por el workspace (`niky-workspace/AGENTS.md`) |
| Latencia de un turno real | **Sin medir.** Por eso el tope de 10 s (`OPENCLAW_ESPERA_MS`) y la pausa de 45 s tras un fallo |

## Si algo falla

- **El servidor dice "sin respuesta todavía"**: el gateway no está encendido, el token no coincide o el agente `niky` no existe. `openclaw agents list` y `openclaw gateway status` lo aclaran.
- **Todo sale como `respaldo`**: es el comportamiento seguro. Mira la ventana negra: cada fallo imprime una línea `[openclaw]` o `[gemini]` con la causa, sin claves.
- **`openclaw` no se reconoce en una ventana nueva**: cierra y abre la terminal. El instalador agregó su carpeta al PATH del usuario.

## Variables que lee `app/server.js`

| Variable | Para qué | Por defecto |
|---|---|---|
| `OPENCLAW_GATEWAY_TOKEN` | Token del gateway (obligatorio para usar OpenClaw) | vacío: se omite el eslabón |
| `OPENCLAW_URL` | Dónde está el gateway. Solo se acepta `127.0.0.1`, `localhost` o `[::1]` | `http://127.0.0.1:18789` |
| `OPENCLAW_AGENTE` | Agente que responde | `niky` |
| `OPENCLAW_ESPERA_MS` | Tiempo máximo de un turno | `10000` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Segundo eslabón | vacío / `gemini-2.5-flash` |
| `PUBLICO` | Carpeta de páginas que se sirve | `app/public` |
| `PORT` | Puerto | `4310` |

## Qué no hacer

- No subir a un commit el workspace del agente (`%USERPROFILE%\.openclaw\workspace-niky`) ni nada de `~\.openclaw`.
- No poner datos reales de estudiantes: el perfil que ve la IA es ficticio y vive en el servidor.
- No presentar un texto de respaldo como respuesta en vivo. La insignia del frente depende de `fuente`.
