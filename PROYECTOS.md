# Cómo está organizada esta carpeta

Una sola carpeta para abrir, varios repositorios adentro. Así el docente es el
único que toca el portal, y cada equipo trabaja en lo suyo sin pisar a nadie.

```
GIT Tecnología con Sentido/        ← EL PORTAL. Solo lo modifica Néstor.
│
├── docs/                          el sitio publicado
├── datos/semillero.json           el estado de los quince proyectos
├── herramientas/                  el generador y la auditoría
├── README.md · BRIEF.md · PUBLICAR.md · BITACORA_TECNICA.md
│
├── La web de la iguana/           ← repositorio propio del Equipo 1
├── App para planeación .../       ← repositorio propio del Equipo 3
├── ROULETTE_EnglishDay2026/       ← repositorio propio del Equipo 5
├── Diverseña/                     ← repositorio propio del Equipo 6
├── Wisfox/                        ← todavía sin repositorio
└── ZOCALAB CARPETA COMPLETA/      ← todavía sin repositorio
```

### La excepción: `SEMILLERO AULA MAKER`

Esa carpeta **sí** se versiona, a diferencia de las de los equipos. Son las
presentaciones de cada sesión y las plantillas en blanco, todo material del
docente: no hay código de estudiantes ni datos personales. Pesa 1,2 MB.

Está dentro por una razón concreta: `herramientas/extraer_modulos.py` la usa como
respaldo cuando la unidad de Drive no está montada, y así el sitio se puede
reconstruir desde cualquier computador que clone el repositorio.

Si se prefiere sacarla, es un comando y queda ignorada de ahí en adelante:

```
git rm -r --cached "SEMILLERO AULA MAKER"
echo '/SEMILLERO AULA MAKER/' >> .gitignore
git commit -m "Saca el material de sesion del repositorio"
```

Tener en cuenta que seguiría estando en el historial de los commits anteriores.

## La regla que sostiene todo esto

**Las carpetas de proyecto no se versionan en el repositorio del portal.**
Están en el `.gitignore`, a propósito.

Cada proyecto es su propio repositorio, con su propio historial y sus propios
autores. Viven dentro de esta carpeta nada más por comodidad: así se abre un solo
sitio en VS Code y están todos a la mano.

### Por qué, si parece más simple meter todo junto

Porque meterlo junto rompe tres cosas a la vez:

1. **Se perdería el código.** Cuatro de esas carpetas ya traen su propio `.git`.
   Si se comitean desde el portal, Git no guarda los archivos: guarda una
   referencia suelta, y en GitHub la carpeta aparece **vacía**. Es el error más
   común al anidar repositorios y no avisa.
2. **Entrarían unos 50.000 archivos**, casi todos de `node_modules`, que son
   dependencias descargadas y no código del equipo.
3. **Los estudiantes escribirían en el repositorio del portal.** Justo lo que no
   se quiere: el portal lo mantiene el docente.

## Para el docente

Trabajas en la carpeta de arriba, la del portal:

```
python herramientas/generar.py     reconstruye las 61 páginas
python herramientas/auditar.py     revisa que no haya nada roto
git add -A && git commit && git push
```

Git nunca te va a ofrecer los archivos de los estudiantes, porque están
ignorados. No hay forma de comitearlos por accidente.

## Para los estudiantes

**Abran la carpeta de su proyecto, no la de arriba.** En VS Code:
*Archivo → Abrir carpeta* y eligen la suya.

Desde ahí, sus commits van a **su** repositorio. El portal ni se entera.

| Equipo | Carpeta que abren | Su repositorio |
|---|---|---|
| 1 | `La web de la iguana` | `lawebdelaiguana` |
| 3 | `App para planeación de inclusión - Camila y Santiago` | `planeacion-inclusiva-piar` |
| 5 | `ROULETTE_EnglishDay2026` | `englishroulette` |
| 6 | `Diverseña` | `diversena` |
| 7 | `Wisfox` | por crear |
| 12 | `ZOCALAB CARPETA COMPLETA` | por crear |

## Los dos proyectos que todavía no tienen repositorio

**Wisfox** y **ZocaLab** están en la carpeta pero no son repositorios: no tienen
historial, y si se borra la carpeta se pierde todo. Para arrancarlos, desde
adentro de la carpeta del proyecto:

```
git init
git add -A
git commit -m "Primera version del proyecto"
git branch -M main
git remote add origin https://github.com/profenapaipa/NOMBRE.git
git push -u origin main
```

Antes de ese `git add -A`, conviene crear un `.gitignore` con al menos:

```
node_modules/
__pycache__/
*.pyc
.vscode/
```

Sin eso, Wisfox subiría miles de archivos de dependencias que no son suyos.

## Un detalle de nombre

La carpeta de ZocaLab tiene un emoji al final del nombre. Funciona, pero en
rutas, en terminales y en algunas herramientas da problemas difíciles de
diagnosticar. Conviene renombrarla a `ZocaLab` a secas. Si se renombra, hay que
revisar que `Iniciar ZocaLab.bat` siga encontrando sus archivos.

## Qué pasa si un proyecto se mueve de sitio

El `.gitignore` del portal nombra las carpetas una por una. Si se agrega un
proyecto nuevo o se renombra uno, hay que agregar o corregir esa línea, o el
portal empezará a ofrecer sus archivos para comitear.
