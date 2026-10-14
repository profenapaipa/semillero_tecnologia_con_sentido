/* ============================================
   ZOCALAB — Los Bosques
   "El quinto elemento eres tú"

   Hay dos bosques ilustrados, cada uno con versión de
   día y de noche (la que se ve depende de la hora real):

     · Bosque del Río      → Glifo de Lluvia · Templo del Viento
     · Bosque de la Laguna → Semilla del Sol  · Estrella del Tiempo

   Cada bosque admite UN solo tipo de árbol, siempre
   relacionado con su temática. Cada día de actividad
   planta un árbol en el bosque que se esté viendo.

   Requiere js/datos.js.
   ============================================ */

const ZocaBosque = (function () {

  const RUTA_ARBOLES = '../assets/arboles/';
  const RUTA_FONDOS  = '../assets/bosque/';

  /* ============================================
     LOS CUATRO RELICARIOS (árboles)
     ============================================ */
  const ARBOLES = {
    lluvia: {
      id: 'lluvia',
      nombre: 'Glifo de Lluvia',
      bosque: 'rio',
      imagen: RUTA_ARBOLES + 'lluvia.jpg',
      icono: '🌧️',
      color: '#2FA7B8',
      texto: 'Sereno y constante. Crece gota a gota, igual que un hábito que se cuida cada día.'
    },
    viento: {
      id: 'viento',
      nombre: 'Templo del Viento',
      bosque: 'rio',
      imagen: RUTA_ARBOLES + 'viento.jpg',
      icono: '🌬️',
      color: '#3AB56A',
      texto: 'Libre y curioso. Lleva tus ideas lejos, como el viento que sigue el curso del río.'
    },
    sol: {
      id: 'sol',
      nombre: 'Semilla del Sol',
      bosque: 'laguna',
      imagen: RUTA_ARBOLES + 'sol.jpg',
      icono: '☀️',
      color: '#C9982A',
      texto: 'Cálido y luminoso. Nace de la energía de cada mañana y de la laguna dorada.'
    },
    estrella: {
      id: 'estrella',
      nombre: 'Estrella del Tiempo',
      bosque: 'laguna',
      imagen: RUTA_ARBOLES + 'estrella.jpg',
      icono: '✨',
      color: '#7B5BD6',
      texto: 'Paciente y sabio. Mide los ciclos del cielo y espera a quienes sostienen su constancia.'
    }
  };

  /* ============================================
     LOS DOS BOSQUES
     agua: zona (en % de la escena) donde brilla el agua.
     ============================================ */
  const BOSQUES = {
    rio: {
      id: 'rio',
      nombre: 'Bosque del Río',
      icono: '🏞️',
      lema: 'Donde el agua sigue su camino',
      arboles: ['lluvia', 'viento'],
      fondos: { dia: RUTA_FONDOS + 'rio-dia.jpg', noche: RUTA_FONDOS + 'rio-noche.jpg' },
      agua: { x: 36, y: 52, w: 30, h: 48 }
    },
    laguna: {
      id: 'laguna',
      nombre: 'Bosque de la Laguna',
      icono: '🌅',
      lema: 'La laguna sagrada de Guatavita',
      arboles: ['sol', 'estrella'],
      fondos: { dia: RUTA_FONDOS + 'laguna-dia.jpg', noche: RUTA_FONDOS + 'laguna-noche.jpg' },
      agua: { x: 24, y: 44, w: 52, h: 26 }
    }
  };

  const ORDEN_BOSQUES = ['rio', 'laguna'];

  /* ============================================
     HORA DEL DÍA
     De 6:00 a 17:59 se ve el bosque de día; el resto,
     el bosque de noche.
     ============================================ */
  function esDeNoche(hora) {
    const h = (typeof hora === 'number') ? hora : new Date().getHours();
    return h >= 18 || h < 6;
  }

  function fondoDe(bosqueId, noche) {
    const b = BOSQUES[bosqueId] || BOSQUES.rio;
    return noche ? b.fondos.noche : b.fondos.dia;
  }

  /* ============================================
     AZAR REPRODUCIBLE
     Posiciones y destellos distintos pero siempre los
     mismos en cada recarga: se derivan de un texto.
     ============================================ */
  function _semilla(texto) {
    let h = 2166136261;
    const cadena = String(texto);
    for (let i = 0; i < cadena.length; i++) {
      h ^= cadena.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;   // entre 0 y 1
  }
  function _variacion(id, indice) {
    return _semilla(id + '::' + indice);
  }

  /* ============================================
     LECTURA Y MIGRACIÓN
     Las versiones anteriores tenían un solo bosque con 6
     especies. Al primer arranque se convierten: cada especie
     antigua pasa a la nueva que más se le parece, y cada
     bosque queda con el tipo de su primer árbol plantado.
     ============================================ */
  function migrar() {
    const D = window.ZocaDatos;
    const bosque = D.leerDato(D.CLAVES.BOSQUE);
    if (bosque.migrado) return bosque;

    try {
      const equivalencia = {
        tierra: 'sol', fuego: 'sol', dorado: 'estrella',
        flor: 'estrella', agua: 'lluvia', aire: 'viento'
      };

      const lista = (bosque.arboles || []).slice().sort(function (a, b) {
        return String(a.fecha).localeCompare(String(b.fecha));
      });

      const tipos = { rio: null, laguna: null };

      lista.forEach(function (arbol) {
        if (!ARBOLES[arbol.tipo]) arbol.tipo = equivalencia[arbol.tipo] || 'sol';
        arbol.bosque = ARBOLES[arbol.tipo].bosque;
        // Un solo tipo por bosque: prevalece el del primer árbol
        if (!tipos[arbol.bosque]) tipos[arbol.bosque] = arbol.tipo;
        arbol.tipo = tipos[arbol.bosque];
      });

      // La especie elegida antes de plantar el primer árbol
      const elegidoAntes = equivalencia[bosque.tipoArbol] || (ARBOLES[bosque.tipoArbol] ? bosque.tipoArbol : null);
      if (elegidoAntes) {
        const donde = ARBOLES[elegidoAntes].bosque;
        if (!tipos[donde]) tipos[donde] = elegidoAntes;
        if (!lista.length) bosque.bosqueActivo = donde;
      }

      bosque.arboles = lista;
      bosque.tiposPorBosque = tipos;
      if (!BOSQUES[bosque.bosqueActivo]) bosque.bosqueActivo = 'rio';
      bosque.migrado = true;
      D.guardarDato(D.CLAVES.BOSQUE, bosque);
    } catch (e) {
      console.error('ZocaBosque: no se pudo migrar el bosque', e);
    }
    return D.leerDato(D.CLAVES.BOSQUE);
  }

  function arbolesDe(bosque, bosqueId) {
    return (bosque.arboles || []).filter(function (a) {
      return (a.bosque || (ARBOLES[a.tipo] && ARBOLES[a.tipo].bosque)) === bosqueId;
    });
  }

  function tipoDe(bosque, bosqueId) {
    return (bosque.tiposPorBosque && bosque.tiposPorBosque[bosqueId]) || null;
  }

  function bosqueActivo(bosque) {
    return BOSQUES[bosque.bosqueActivo] ? bosque.bosqueActivo : 'rio';
  }

  function cambiarBosque(bosqueId) {
    if (!BOSQUES[bosqueId]) return false;
    const D = window.ZocaDatos;
    return !!D.actualizarDato(D.CLAVES.BOSQUE, 'bosqueActivo', bosqueId);
  }

  // Un bosque solo puede cambiar de especie mientras esté vacío
  function puedeCambiarTipo(bosque, bosqueId) {
    return arbolesDe(bosque, bosqueId).length === 0;
  }

  function elegirTipo(bosqueId, tipo) {
    const D = window.ZocaDatos;
    if (!BOSQUES[bosqueId] || !ARBOLES[tipo]) return false;
    if (ARBOLES[tipo].bosque !== bosqueId) return false;   // debe ser afín al bosque
    const bosque = D.leerDato(D.CLAVES.BOSQUE);
    if (tipoDe(bosque, bosqueId) && !puedeCambiarTipo(bosque, bosqueId)) return false;
    return !!D.actualizarDato(D.CLAVES.BOSQUE, 'tiposPorBosque.' + bosqueId, tipo);
  }

  /* ============================================
     DISPOSICIÓN DE LOS ÁRBOLES
     Filas en perspectiva. El árbol más reciente ocupa el
     centro de la fila delantera; los anteriores se van
     alejando hacia el fondo, cada vez más pequeños.
     y = distancia al borde inferior (% del alto de la escena)
     ancho = ancho del árbol (% del ancho de la escena)
     ============================================ */
  const FILAS = [
    { y: 3,    ancho: 9.5, cap: 6 },
    { y: 11,   ancho: 8,   cap: 9 },
    { y: 18.5, ancho: 6.6, cap: 12 },
    { y: 25,   ancho: 5.4, cap: 15 },
    { y: 30.5, ancho: 4.4, cap: 18 }
  ];

  // Todas las posiciones posibles, en el orden en que se ocupan
  function _posiciones(cantidad) {
    const lista = [];
    FILAS.forEach(function (fila, indiceFila) {
      const anchoUtil = 76;
      const huecos = [];
      for (let j = 0; j < fila.cap; j++) {
        huecos.push(12 + anchoUtil * (j + 0.5) / fila.cap);
      }
      // Del centro hacia afuera
      huecos.sort(function (a, b) { return Math.abs(a - 50) - Math.abs(b - 50); });
      huecos.forEach(function (x) {
        lista.push({ x: x, y: fila.y, ancho: fila.ancho, fila: indiceFila });
      });
    });
    // Si hay más árboles que huecos, se apilan en el fondo, más chicos
    let extra = 0;
    while (lista.length < cantidad) {
      const x = 10 + _variacion('extra', extra) * 80;
      lista.push({ x: x, y: 34 + (extra % 3) * 2, ancho: 3.6, fila: FILAS.length });
      extra++;
    }
    return lista;
  }

  function _formatoFecha(iso) {
    const D = window.ZocaDatos;
    if (!iso) return '';
    const p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return iso;
    return Number(p[2]) + ' ' + D.MESES[Number(p[1]) - 1].slice(0, 3) + ' ' + p[0];
  }

  // Pinta los árboles del bosque indicado dentro del contenedor
  function renderizarArboles(contenedor, bosque, bosqueId) {
    if (!contenedor) return;

    const lista = arbolesDe(bosque, bosqueId).slice();
    // Del más nuevo al más viejo: el de hoy queda al frente
    lista.sort(function (a, b) {
      return String(b.creado || b.fecha).localeCompare(String(a.creado || a.fecha));
    });

    const sitios = _posiciones(lista.length);
    let html = '';

    lista.forEach(function (arbol, indice) {
      const tipo = ARBOLES[arbol.tipo] ? arbol.tipo : (tipoDe(bosque, bosqueId) || BOSQUES[bosqueId].arboles[0]);
      const def = ARBOLES[tipo];
      const sitio = sitios[indice];
      const id = arbol.id || ('a' + indice);
      const jitter = (_variacion(id, 4) - 0.5) * 2.2;
      const retraso = -(_variacion(id, 7) * 6).toFixed(2);

      html +=
        '<div class="mz-arbol" style="' +
          'left:' + (sitio.x + jitter).toFixed(2) + '%;' +
          'bottom:' + sitio.y + '%;' +
          'width:' + sitio.ancho + '%;' +
          'z-index:' + (100 - sitio.fila * 10 - Math.round(sitio.x / 20)) + ';' +
          '--mz-retraso:' + retraso + 's;' +
          '" data-id="' + id + '" title="' + def.nombre + ' · ' + _formatoFecha(arbol.fecha) + '">' +
          '<img src="' + def.imagen + '" alt="' + def.nombre + '" draggable="false">' +
        '</div>';
    });

    contenedor.innerHTML = html;
  }

  /* ============================================
     EFECTOS AMBIENTALES DE LA ESCENA
     De día: polen dorado, rayos de luz y brillo en el agua.
     De noche: luciérnagas, bruma y destellos en el agua.
     ============================================ */
  function montarEfectos(contenedor, bosqueId, noche) {
    if (!contenedor) return;
    const b = BOSQUES[bosqueId] || BOSQUES.rio;
    let html = '';

    // Brillo del agua
    html += '<div class="mz-agua' + (noche ? ' noche' : '') + '" style="' +
      'left:' + b.agua.x + '%;top:' + b.agua.y + '%;width:' + b.agua.w + '%;height:' + b.agua.h + '%"></div>';

    if (noche) {
      html += '<div class="mz-bruma"></div><div class="mz-bruma mz-bruma-2"></div>';
      for (let i = 0; i < 18; i++) {
        const x = 6 + _variacion('lu-x' + bosqueId, i) * 88;
        const y = 30 + _variacion('lu-y' + bosqueId, i) * 62;
        const dur = 6 + _variacion('lu-d', i) * 7;
        const ret = -_variacion('lu-r', i) * 10;
        html += '<span class="mz-luciernaga" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
                '%;animation-duration:' + dur.toFixed(1) + 's,' + (2 + _variacion('lu-p', i) * 2.5).toFixed(1) +
                's;animation-delay:' + ret.toFixed(1) + 's,' + ret.toFixed(1) + 's"></span>';
      }
      // Estrellas que titilan en el cielo
      for (let i = 0; i < 12; i++) {
        const x = 4 + _variacion('es-x', i) * 92;
        const y = 2 + _variacion('es-y', i) * 30;
        html += '<span class="mz-destello" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
                '%;animation-delay:' + (_variacion('es-r', i) * 4).toFixed(1) + 's"></span>';
      }
      html += '<span class="mz-fugaz"></span>';
    } else {
      html += '<div class="mz-rayos-luz"></div>';
      for (let i = 0; i < 20; i++) {
        const x = 4 + _variacion('po-x' + bosqueId, i) * 92;
        const y = 24 + _variacion('po-y' + bosqueId, i) * 68;
        const dur = 7 + _variacion('po-d', i) * 8;
        const ret = -_variacion('po-r', i) * 12;
        const tam = 3 + _variacion('po-t', i) * 4;
        html += '<span class="mz-polen" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
                '%;width:' + tam.toFixed(1) + 'px;height:' + tam.toFixed(1) +
                'px;animation-duration:' + dur.toFixed(1) + 's;animation-delay:' + ret.toFixed(1) + 's"></span>';
      }
      html += '<span class="mz-ave" style="top:14%"></span><span class="mz-ave mz-ave-2" style="top:24%"></span>';
    }

    contenedor.innerHTML = html;
  }

  /* ============================================
     PLANTAR EL ÁRBOL DEL DÍA
     Se planta en el bosque que se está viendo. Devuelve el
     árbol creado, o null si hoy ya se plantó (uno por día)
     o si ese bosque todavía no tiene su tipo elegido.
     ============================================ */
  function plantarArbol() {
    if (!window.ZocaDatos) return null;
    const D = window.ZocaDatos;

    try {
      const bosque = migrar();
      const hoy = D.hoyISO();
      const donde = bosqueActivo(bosque);
      const tipo = tipoDe(bosque, donde);

      if (D.esHoy(bosque.ultimoEstudio)) return null;
      if (!tipo) return null;

      // Si el último árbol fue ayer, la racha continúa; si no, vuelve a 1
      if (D.esAyer(bosque.ultimoEstudio)) {
        bosque.diasRacha = (bosque.diasRacha || 0) + 1;
      } else {
        bosque.diasRacha = 1;
      }

      const nuevo = {
        id: D.generarId(),
        tipo: tipo,
        bosque: donde,
        fecha: hoy,
        etapa: 5,
        creado: new Date().toISOString()
      };

      bosque.arboles.push(nuevo);
      bosque.totalArboles = bosque.arboles.length;
      bosque.ultimoEstudio = hoy;

      D.guardarDato(D.CLAVES.BOSQUE, bosque);
      return nuevo;
    } catch (e) {
      console.error('ZocaBosque: no se pudo plantar el árbol', e);
      return null;
    }
  }

  /* ============================================
     ESTADO DE LA RACHA
     ============================================ */
  function estadoRacha(bosque) {
    if (!window.ZocaDatos) return { clase: '', mensaje: '', dias: 0 };
    const dias = window.ZocaDatos.diasDesde(bosque.ultimoEstudio);

    if (!bosque.ultimoEstudio || !isFinite(dias)) {
      return { clase: '', mensaje: '', dias: 0 };
    }
    if (dias <= 0) return { clase: '', mensaje: '', dias: 0 };
    if (dias === 1) return { clase: 'sin-racha-1', mensaje: '', dias: 1 };
    if (dias === 2) return { clase: 'sin-racha-2', mensaje: '', dias: 2 };
    return { clase: 'sin-racha-3', mensaje: 'Tu bosque te espera 🌿', dias: dias };
  }

  // Hojas que caen cuando el bosque lleva días sin cuidado
  function lloverHojas(contenedor, cantidad) {
    if (!contenedor) return;
    const total = cantidad || 8;
    let html = '';
    for (let i = 0; i < total; i++) {
      const izquierda = 6 + _variacion('hoja', i) * 88;
      const retraso = _variacion('hoja-d', i) * 6;
      html += '<span class="zl-hoja-cae" style="left:' + izquierda.toFixed(1) + '%;' +
              'top:12%;animation-delay:' + retraso.toFixed(1) + 's">🍂</span>';
    }
    contenedor.innerHTML = html;
  }

  /* ============================================
     RESUMEN DE TODOS LOS BOSQUES ("Mis árboles")
     ============================================ */
  function renderizarResumen(contenedor, bosque, alElegir) {
    if (!contenedor) return;
    let html = '';

    ORDEN_BOSQUES.forEach(function (id) {
      const b = BOSQUES[id];
      const lista = arbolesDe(bosque, id).slice().sort(function (x, y) {
        return String(y.creado || y.fecha).localeCompare(String(x.creado || x.fecha));
      });
      const tipo = tipoDe(bosque, id);
      const def = tipo ? ARBOLES[tipo] : null;

      html +=
        '<section class="mz-resumen-bosque" style="--mz-tinte:' + (def ? def.color : '#C9982A') + '">' +
          '<header class="mz-resumen-cab">' +
            '<span class="mz-resumen-icono" aria-hidden="true">' + b.icono + '</span>' +
            '<div class="mz-resumen-titulo">' +
              '<strong>' + b.nombre + '</strong>' +
              '<span>' + (def ? def.nombre : 'Aún sin árbol elegido') + '</span>' +
            '</div>' +
            '<span class="mz-resumen-total">' + lista.length + (lista.length === 1 ? ' árbol' : ' árboles') + '</span>' +
          '</header>';

      if (!lista.length) {
        html += '<p class="mz-resumen-vacio">Todavía no has plantado aquí. ' +
                '<button type="button" class="mz-enlace" data-ir-bosque="' + id + '">Ir a este bosque</button></p>';
      } else {
        html += '<div class="mz-resumen-grid">';
        lista.forEach(function (a) {
          const t = ARBOLES[a.tipo] || def;
          html +=
            '<div class="mz-resumen-arbol" title="' + t.nombre + '">' +
              '<img src="' + t.imagen + '" alt="' + t.nombre + '" loading="lazy">' +
              '<span>' + _formatoFecha(a.fecha) + '</span>' +
            '</div>';
        });
        html += '</div>';
      }
      html += '</section>';
    });

    contenedor.innerHTML = html;

    contenedor.querySelectorAll('[data-ir-bosque]').forEach(function (boton) {
      boton.addEventListener('click', function () {
        if (alElegir) alElegir(boton.dataset.irBosque);
      });
    });
  }

  /* ============================================
     API PÚBLICA
     ============================================ */
  return {
    ARBOLES: ARBOLES,
    BOSQUES: BOSQUES,
    ORDEN_BOSQUES: ORDEN_BOSQUES,
    esDeNoche: esDeNoche,
    fondoDe: fondoDe,
    migrar: migrar,
    arbolesDe: arbolesDe,
    tipoDe: tipoDe,
    bosqueActivo: bosqueActivo,
    cambiarBosque: cambiarBosque,
    puedeCambiarTipo: puedeCambiarTipo,
    elegirTipo: elegirTipo,
    renderizarArboles: renderizarArboles,
    renderizarResumen: renderizarResumen,
    montarEfectos: montarEfectos,
    plantarArbol: plantarArbol,
    estadoRacha: estadoRacha,
    lloverHojas: lloverHojas
  };
})();

window.ZocaBosque = ZocaBosque;
