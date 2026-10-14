/* ============================================
   ZOCALAB — El Cóndor, guardián del tiempo
   "El quinto elemento eres tú"

   El Cóndor vigila cuánto tiempo llevas frente a la
   pantalla y te invita a levantar la vista. No castiga
   ni bloquea nada: solo cuida tu equilibrio.

   Se carga en todas las páginas y se inicia con:
     ZocaCondor.init()

   Requiere js/datos.js (leerDato / actualizarDato) y
   usa js/sonidos.js si está disponible.
   ============================================ */

const ZocaCondor = (function () {

  // ====== ESTADO INTERNO ======
  let temporizador   = null;   // intervalo que revisa cada 30 s
  let inicioSesion   = 0;      // marca de tiempo en que empezó a contar
  let alertaVisible  = false;
  let enfoqueFin     = 0;      // marca de tiempo en que termina el modo enfoque
  let enfoqueTimer   = null;

  // Cada cuánto se revisa el reloj (no hace falta más precisión)
  const PASO_REVISION_MS = 30000;

  // Clave de almacenamiento del Cóndor
  function _clave() {
    return window.ZocaDatos ? window.ZocaDatos.CLAVES.CONDOR : 'zocalab_condor';
  }

  // Lee la configuración del Cóndor apoyándose en js/datos.js.
  // Si datos.js no se cargó, devuelve valores seguros por defecto.
  function _config() {
    if (window.ZocaDatos) return window.ZocaDatos.leerDato(_clave());
    return {
      activado: true,
      intervaloMinutos: 25,
      silenciadoHasta: null,
      modoEnfoque: false,
      tiempoEnfoqueMinutos: 25
    };
  }

  function _guardarCampo(campo, valor) {
    if (window.ZocaDatos) window.ZocaDatos.actualizarDato(_clave(), campo, valor);
  }

  // Minutos que lleva el usuario en esta visita
  function minutosEnPantalla() {
    return Math.floor((Date.now() - inicioSesion) / 60000);
  }

  /* ============================================
     MENSAJE SEGÚN EL TIEMPO ACUMULADO
     Mientras más tiempo lleva, más directo es el Cóndor.
     ============================================ */
  function _mensajeSegunTiempo(minutos) {
    if (minutos >= 90) return 'Para ya. Bebe agua.';
    if (minutos >= 60) return 'Tómate un descanso real';
    if (minutos >= 45) return 'Tu cuerpo necesita moverse';
    return 'Alza la vista un momento';
  }

  /* ============================================
     LA ALERTA
     Elemento flotante que entra desde la derecha.
     ============================================ */
  function mostrarAlerta() {
    if (alertaVisible) return;

    // Nunca se apilan dos alertas
    const previa = document.getElementById('zlCondorAlerta');
    if (previa) previa.remove();

    const minutos = Math.max(1, minutosEnPantalla());
    const aviso = document.createElement('div');
    aviso.className = 'zl-condor';
    aviso.id = 'zlCondorAlerta';
    aviso.setAttribute('role', 'alertdialog');
    aviso.setAttribute('aria-live', 'polite');
    aviso.setAttribute('aria-label', 'Aviso del Cóndor');

    aviso.innerHTML =
      '<span class="zl-condor-icono" aria-hidden="true">🦅</span>' +
      '<div class="zl-condor-titulo">' + _mensajeSegunTiempo(minutos) + '</div>' +
      '<p class="zl-condor-texto">Llevas ' + minutos + ' minuto' + (minutos === 1 ? '' : 's') +
        ' aquí.<br>El Cóndor cuida tu equilibrio.</p>' +
      '<div class="zl-condor-acciones">' +
        '<button class="zl-condor-btn zl-condor-btn-claro" id="zlCondorPausa">Tomar pausa (2 min)</button>' +
        '<button class="zl-condor-btn zl-condor-btn-borde" id="zlCondorSeguir">Continuar 15 min más</button>' +
      '</div>';

    document.body.appendChild(aviso);
    alertaVisible = true;

    // Sonido suave de aviso, si el motor de sonido está cargado
    try {
      if (window.zocaSound) window.zocaSound.navegar();
    } catch (e) {
      console.error('ZocaCondor: no se pudo reproducir el aviso', e);
    }

    // ====== Tomar pausa: abre la respiración Nom parejo (5-5) ======
    document.getElementById('zlCondorPausa').addEventListener('click', function () {
      cerrarAlerta();
      reiniciarConteo();
      abrirPausaRespiracion();
    });

    // ====== Continuar: silencia al Cóndor por 15 minutos ======
    document.getElementById('zlCondorSeguir').addEventListener('click', function () {
      cerrarAlerta();
      silenciar(15);
    });
  }

  function cerrarAlerta() {
    const aviso = document.getElementById('zlCondorAlerta');
    if (!aviso) { alertaVisible = false; return; }
    aviso.classList.add('cerrando');
    setTimeout(function () {
      aviso.remove();
      alertaVisible = false;
    }, 350);
  }

  /* ============================================
     PAUSA DE RESPIRACIÓN — Nom parejo (5 inhala / 5 exhala)
     Se construye aquí mismo para que funcione en cualquier
     página, sin depender de pages/meditacion.html.
     ============================================ */
  function abrirPausaRespiracion(ciclosTotales) {
    const ciclos = ciclosTotales || 12;   // 12 ciclos de 10 s = 2 minutos
    const previa = document.getElementById('zlCondorRespira');
    if (previa) previa.remove();

    const capa = document.createElement('div');
    capa.className = 'zl-respiracion abierto';
    capa.id = 'zlCondorRespira';
    capa.innerHTML =
      '<button class="zl-cerrar-inmersivo" id="zlRespiraCerrar" aria-label="Salir de la pausa">✕</button>' +
      '<div class="zl-respira-nombre">Nom parejo · 5-5</div>' +
      '<div class="zl-circulo-respira" id="zlRespiraCirculo">' +
        // Patrón geométrico muisca en el borde del círculo
        '<svg viewBox="0 0 150 150" aria-hidden="true">' +
          '<circle cx="75" cy="75" r="70" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>' +
          '<circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1" ' +
            'stroke-dasharray="7 5"/>' +
          '<path d="M75 8 L86 20 L75 32 L64 20 Z M142 75 L130 86 L118 75 L130 64 Z ' +
                  'M75 142 L64 130 L75 118 L86 130 Z M8 75 L20 64 L32 75 L20 86 Z" ' +
            'fill="rgba(201,152,42,0.75)"/>' +
        '</svg>' +
      '</div>' +
      '<div class="zl-respira-fase" id="zlRespiraFase">Prepárate</div>' +
      '<div class="zl-respira-ciclo" id="zlRespiraCiclo">Ciclo 1 de ' + ciclos + '</div>';

    document.body.appendChild(capa);

    const circulo = document.getElementById('zlRespiraCirculo');
    const textoFase = document.getElementById('zlRespiraFase');
    const textoCiclo = document.getElementById('zlRespiraCiclo');

    let ciclo = 1;
    let temporizadores = [];

    function limpiar() {
      temporizadores.forEach(clearTimeout);
      temporizadores = [];
    }

    function unCiclo() {
      if (ciclo > ciclos) {
        limpiar();
        textoFase.textContent = 'Listo 🌿';
        textoCiclo.textContent = 'Respiraste ' + ciclos + ' ciclos';
        circulo.style.transform = 'scale(1)';
        temporizadores.push(setTimeout(cerrarPausa, 2200));
        return;
      }

      textoCiclo.textContent = 'Ciclo ' + ciclo + ' de ' + ciclos;

      // Inhalar 5 s — el círculo se expande
      textoFase.textContent = 'Inhala';
      circulo.style.transition = 'transform 5s ease-in-out';
      circulo.style.transform = 'scale(1.4)';

      temporizadores.push(setTimeout(function () {
        // Exhalar 5 s — el círculo se contrae
        textoFase.textContent = 'Exhala';
        circulo.style.transform = 'scale(1)';
        temporizadores.push(setTimeout(function () {
          ciclo++;
          unCiclo();
        }, 5000));
      }, 5000));
    }

    function cerrarPausa() {
      limpiar();
      const nodo = document.getElementById('zlCondorRespira');
      if (nodo) nodo.remove();
      reiniciarConteo();
    }

    document.getElementById('zlRespiraCerrar').addEventListener('click', cerrarPausa);
    // Pequeña espera para que la pantalla aparezca antes de empezar
    temporizadores.push(setTimeout(unCiclo, 1000));
  }

  /* ============================================
     SILENCIAR
     ============================================ */
  function silenciar(minutos) {
    const hasta = Date.now() + minutos * 60000;
    _guardarCampo('silenciadoHasta', hasta);
    reiniciarConteo();
  }

  // Vuelve a cero el contador de tiempo en pantalla
  function reiniciarConteo() {
    inicioSesion = Date.now();
  }

  /* ============================================
     MODO ENFOQUE
     Silencia al Cóndor por un tiempo definido y muestra
     una barra de progreso. Al terminar, avisa con suavidad.
     ============================================ */
  function activarModoEnfoque(minutos) {
    const duracion = Number(minutos) || _config().tiempoEnfoqueMinutos || 25;
    enfoqueFin = Date.now() + duracion * 60000;

    _guardarCampo('modoEnfoque', true);
    silenciar(duracion);

    // ====== Barra de progreso del enfoque ======
    const previa = document.getElementById('zlEnfoqueBarra');
    if (previa) previa.remove();

    const barra = document.createElement('div');
    barra.className = 'zl-enfoque-barra';
    barra.id = 'zlEnfoqueBarra';
    barra.innerHTML =
      '<span aria-hidden="true">🎯</span>' +
      '<span id="zlEnfoqueTexto">Modo enfoque · ' + duracion + ' min</span>' +
      '<div class="zl-progreso"><div class="zl-progreso-fill" id="zlEnfoqueFill" style="width:0%"></div></div>' +
      '<button id="zlEnfoqueSalir">Terminar</button>';
    document.body.appendChild(barra);

    const relleno = document.getElementById('zlEnfoqueFill');
    const texto = document.getElementById('zlEnfoqueTexto');
    const totalMs = duracion * 60000;

    if (enfoqueTimer) clearInterval(enfoqueTimer);
    enfoqueTimer = setInterval(function () {
      const restante = enfoqueFin - Date.now();
      if (restante <= 0) {
        terminarModoEnfoque(true);
        return;
      }
      const avance = ((totalMs - restante) / totalMs) * 100;
      relleno.style.width = avance.toFixed(1) + '%';
      const minRestantes = Math.ceil(restante / 60000);
      texto.textContent = 'Modo enfoque · quedan ' + minRestantes + ' min';
    }, 1000);

    document.getElementById('zlEnfoqueSalir').addEventListener('click', function () {
      terminarModoEnfoque(false);
    });
  }

  function terminarModoEnfoque(completado) {
    if (enfoqueTimer) { clearInterval(enfoqueTimer); enfoqueTimer = null; }
    const barra = document.getElementById('zlEnfoqueBarra');
    if (barra) barra.remove();

    _guardarCampo('modoEnfoque', false);
    _guardarCampo('silenciadoHasta', null);
    reiniciarConteo();

    // Al completar el enfoque, el Cóndor aparece con un aviso suave
    if (completado) {
      try {
        if (window.zocaSound) window.zocaSound.logro();
      } catch (e) {
        console.error('ZocaCondor: no se pudo reproducir el cierre de enfoque', e);
      }
      setTimeout(mostrarAlerta, 700);
    }
  }

  /* ============================================
     REVISIÓN PERIÓDICA
     ============================================ */
  function _revisar() {
    const config = _config();

    if (!config.activado) return;
    if (alertaVisible) return;

    // Silencio vigente (por "continuar 15 min" o por modo enfoque)
    if (config.silenciadoHasta && Date.now() < config.silenciadoHasta) return;

    // Si el silencio ya venció, se limpia
    if (config.silenciadoHasta && Date.now() >= config.silenciadoHasta) {
      _guardarCampo('silenciadoHasta', null);
    }

    const intervalo = Number(config.intervaloMinutos) || 25;
    if (minutosEnPantalla() >= intervalo) mostrarAlerta();
  }

  /* ============================================
     INICIO
     ============================================ */
  function init() {
    reiniciarConteo();

    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(_revisar, PASO_REVISION_MS);

    // Al volver a una pestaña abandonada hace mucho, el contador
    // se reinicia: el tiempo fuera de la pantalla no cuenta.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        if (minutosEnPantalla() >= 10) reiniciarConteo();
      }
    });
  }

  // Detiene el guardián (por ejemplo antes de cerrar sesión)
  function detener() {
    if (temporizador) { clearInterval(temporizador); temporizador = null; }
    if (enfoqueTimer) { clearInterval(enfoqueTimer); enfoqueTimer = null; }
  }

  /* ============================================
     API PÚBLICA
     ============================================ */
  return {
    init: init,
    detener: detener,
    mostrarAlerta: mostrarAlerta,
    cerrarAlerta: cerrarAlerta,
    silenciar: silenciar,
    reiniciarConteo: reiniciarConteo,
    minutosEnPantalla: minutosEnPantalla,
    activarModoEnfoque: activarModoEnfoque,
    terminarModoEnfoque: terminarModoEnfoque,
    abrirPausaRespiracion: abrirPausaRespiracion
  };
})();

window.ZocaCondor = ZocaCondor;
