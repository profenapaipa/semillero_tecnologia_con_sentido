/* ============================================
   ZOCALAB — Escenas animadas de fondo
   "El quinto elemento eres tú"

   Cada sección de la app tiene su propio paisaje
   ornamentado, con cosas que se mueven:

     · sol     → Mi día: sol con rayos, nubes, aves y plantas
                 despiertas que se estiran hacia la luz.
     · luna    → Cerrar día: luna, estrellas, luciérnagas y las
                 mismas plantas, ahora dormidas.
     · espacio → Mi espacio: vides, espirales de oro y sellos
                 flotantes.
     · perfil  → Mi Muysca: polen dorado y espirales.

   Todo son capas fixed con pointer-events:none; no
   estorban ni tapan el contenido. Estilos: css/muisca.css.
   ============================================ */

const ZocaEscenas = (function () {

  /* ---------- Azar reproducible (mismas posiciones en cada carga) ---------- */
  function _semilla(texto) {
    let h = 2166136261;
    const c = String(texto);
    for (let i = 0; i < c.length; i++) {
      h ^= c.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }
  function _v(id, i) { return _semilla(id + '::' + i); }

  /* ============================================
     PIEZAS SVG REUTILIZABLES
     ============================================ */

  // Sol muisca: disco con espiral, anillo de rayos rectos y otro de rayos curvos
  function svgSol() {
    let rayos = '';
    for (let i = 0; i < 16; i++) {
      const a = i * 22.5;
      rayos += '<path d="M100 6 L109 44 L91 44 Z" fill="#E7B23A" transform="rotate(' + a + ' 100 100)"/>';
    }
    let rayosCortos = '';
    for (let i = 0; i < 16; i++) {
      const a = i * 22.5 + 11.25;
      rayosCortos += '<path d="M100 22 L105 46 L95 46 Z" fill="#F6D57A" transform="rotate(' + a + ' 100 100)"/>';
    }
    return '' +
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="mzSolG" cx="50%" cy="45%" r="60%">' +
            '<stop offset="0%" stop-color="#FFF3B8"/><stop offset="60%" stop-color="#F4C842"/><stop offset="100%" stop-color="#D99A1E"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<g class="mz-sol-rayos">' + rayos + rayosCortos + '</g>' +
        '<circle cx="100" cy="100" r="50" fill="url(#mzSolG)" stroke="#B57F14" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="40" fill="none" stroke="#B57F14" stroke-width="1.6" stroke-dasharray="3 5" opacity="0.7"/>' +
        '<path d="M100 100 m0 0 a5 5 0 1 1 5 5 a11 11 0 1 1 -11 -11 a18 18 0 1 1 18 18 a25 25 0 1 1 -25 -25" ' +
              'fill="none" stroke="#A56F10" stroke-width="3" stroke-linecap="round" opacity="0.85"/>' +
      '</svg>';
  }

  function svgNube(tono) {
    const c = tono || '#ffffff';
    return '<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g fill="' + c + '">' +
        '<ellipse cx="60" cy="62" rx="52" ry="24"/><ellipse cx="112" cy="46" rx="46" ry="34"/>' +
        '<ellipse cx="160" cy="62" rx="50" ry="24"/><ellipse cx="96" cy="66" rx="70" ry="20"/>' +
      '</g></svg>';
  }

  function svgAve() {
    return '<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path class="mz-ala-a" d="M2 18 Q14 2 30 16 Q46 2 58 18 Q46 12 30 22 Q14 12 2 18Z" fill="#2c4a3a"/>' +
      '</svg>';
  }

  function svgMariposa(c1, c2) {
    return '<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g class="mz-alas">' +
        '<path d="M20 15 C6 0 0 6 4 16 C6 22 14 20 20 15Z" fill="' + c1 + '"/>' +
        '<path d="M20 15 C34 0 40 6 36 16 C34 22 26 20 20 15Z" fill="' + c1 + '"/>' +
        '<path d="M20 15 C10 20 8 28 14 28 C18 28 20 22 20 15Z" fill="' + c2 + '"/>' +
        '<path d="M20 15 C30 20 32 28 26 28 C22 28 20 22 20 15Z" fill="' + c2 + '"/>' +
      '</g>' +
      '<rect x="19" y="9" width="2" height="14" rx="1" fill="#3a2a1a"/>' +
      '</svg>';
  }

  /* --------------------------------------------------------
     PLANTA
     Una sola planta con dos estados (clase en el <svg>):
       .despierta → hojas erguidas, flor abierta, se inclina al sol
       .dormida   → hojas caídas, flor cerrada y cabeceando
     La transición entre ambos es CSS, así que al cambiar la clase
     se ve cómo la planta se duerme.
     -------------------------------------------------------- */
  function svgPlanta(id, opciones) {
    const o = opciones || {};
    const flor = o.flor || '#F4B942';
    const centro = o.centro || '#C4522A';
    const verde = o.verde || '#2F8F4E';
    const verde2 = o.verde2 || '#48B26A';
    const conFlor = o.conFlor !== false;

    // Cuatro pares de hojas a distintas alturas
    let hojas = '';
    const alturas = [128, 104, 80, 58];
    alturas.forEach(function (y, i) {
      const largo = 40 - i * 6;
      hojas +=
        '<g class="mz-hoja mz-hoja-i" style="transform-origin:50px ' + y + 'px;--mz-r:' + (i * 6) + 'deg">' +
          '<path d="M50 ' + y + ' C ' + (50 - largo * 0.5) + ' ' + (y - 14) + ', ' + (50 - largo) + ' ' + (y - 10) + ', ' + (50 - largo - 6) + ' ' + (y - 22) +
          ' C ' + (50 - largo * 0.55) + ' ' + (y - 24) + ', ' + (50 - 8) + ' ' + (y - 12) + ', 50 ' + y + 'Z" fill="' + (i % 2 ? verde2 : verde) + '"/>' +
          '<path d="M50 ' + y + ' Q ' + (50 - largo * 0.55) + ' ' + (y - 14) + ' ' + (50 - largo) + ' ' + (y - 20) + '" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/>' +
        '</g>' +
        '<g class="mz-hoja mz-hoja-d" style="transform-origin:50px ' + (y - 8) + 'px;--mz-r:' + (i * 6) + 'deg">' +
          '<path d="M50 ' + (y - 8) + ' C ' + (50 + largo * 0.5) + ' ' + (y - 22) + ', ' + (50 + largo) + ' ' + (y - 18) + ', ' + (50 + largo + 6) + ' ' + (y - 30) +
          ' C ' + (50 + largo * 0.55) + ' ' + (y - 32) + ', ' + (50 + 8) + ' ' + (y - 20) + ', 50 ' + (y - 8) + 'Z" fill="' + (i % 2 ? verde : verde2) + '"/>' +
          '<path d="M50 ' + (y - 8) + ' Q ' + (50 + largo * 0.55) + ' ' + (y - 22) + ' ' + (50 + largo) + ' ' + (y - 28) + '" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/>' +
        '</g>';
    });

    // Flor de 8 pétalos
    let petalos = '';
    for (let p = 0; p < 8; p++) {
      // La rotación va en un <g> aparte: así el "scale" de .mz-petalo (que cierra la flor
      // al dormirse) no se mezcla con el transform-origin de la rotación.
      petalos += '<g transform="rotate(' + (p * 45) + ' 50 32)">' +
                 '<ellipse class="mz-petalo" cx="50" cy="20" rx="6" ry="13" fill="' + flor + '" style="transform-origin:50px 32px"/></g>';
    }
    const florSvg = conFlor
      ? '<g class="mz-flor" style="transform-origin:50px 46px">' +
          '<g class="mz-flor-cabeza" style="transform-origin:50px 32px">' + petalos +
            '<circle cx="50" cy="32" r="8.5" fill="' + centro + '"/>' +
            '<circle cx="50" cy="32" r="4" fill="#7a2c12" opacity=".55"/>' +
          '</g>' +
        '</g>'
      : '<g class="mz-flor" style="transform-origin:50px 46px"><g class="mz-flor-cabeza" style="transform-origin:50px 40px">' +
          '<ellipse cx="50" cy="34" rx="7" ry="14" fill="' + verde2 + '"/></g></g>';

    return '' +
      '<svg class="mz-planta despierta" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-id="' + id + '">' +
        '<g class="mz-planta-cuerpo" style="transform-origin:50px 158px">' +
          '<path d="M50 158 C 51 130, 47 92, 50 46" stroke="#25703E" stroke-width="5" fill="none" stroke-linecap="round"/>' +
          hojas +
          florSvg +
        '</g>' +
      '</svg>';
  }

  // Hilera de plantas al pie de la escena
  function plantasFila(estadoInicial) {
    const paleta = [
      { flor: '#F4B942', centro: '#C4522A' },
      { flor: '#F08A5D', centro: '#8B2E13' },
      { flor: '#F7D774', centro: '#B5651D' },
      { flor: '#E9776B', centro: '#7A2C12' },
      { flor: '#F4B942', centro: '#C4522A' },
      { flor: '#F2A65A', centro: '#8B2E13' },
      { flor: '#F7D774', centro: '#C4522A' }
    ];
    let html = '';
    paleta.forEach(function (p, i) {
      const escala = (0.8 + _v('planta-h', i) * 0.4).toFixed(2);
      const izq = 3 + i * 14.2 + (_v('planta-x', i) - 0.5) * 3;
      html +=
        '<div class="mz-planta-caja" style="left:' + izq.toFixed(1) + '%;--mz-s:' + escala + ';--mz-i:' + i + '">' +
          svgPlanta('p' + i, { flor: p.flor, centro: p.centro, conFlor: i % 3 !== 2, verde: i % 2 ? '#2F8F4E' : '#3C9B57' }) +
        '</div>';
    });
    return '<div class="mz-plantas ' + estadoInicial + '">' + html + '</div>';
  }

  // Ornamento de greca escalonada (borde inferior)
  function grecaPie() {
    return '<div class="mz-greca-pie"></div>';
  }

  /* ============================================
     ESCENA: SOL (Mi día)
     ============================================ */
  function escenaSol() {
    let motas = '';
    for (let i = 0; i < 26; i++) {
      const x = _v('sol-mx', i) * 100;
      const y = 15 + _v('sol-my', i) * 80;
      const t = 3 + _v('sol-mt', i) * 5;
      motas += '<span class="mz-polen" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
               '%;width:' + t.toFixed(1) + 'px;height:' + t.toFixed(1) +
               'px;animation-duration:' + (8 + _v('sol-md', i) * 9).toFixed(1) + 's;animation-delay:-' +
               (_v('sol-mr', i) * 14).toFixed(1) + 's"></span>';
    }
    return '' +
      '<div class="mz-cielo mz-cielo-sol"></div>' +
      '<div class="mz-capa" data-profundidad="0.02">' +
        '<div class="mz-sol-caja">' + svgSol() + '</div>' +
        '<div class="mz-rayos-haz"><i></i><i></i><i></i><i></i><i></i></div>' +
      '</div>' +
      '<div class="mz-capa" data-profundidad="0.05">' +
        '<div class="mz-nube mz-nube-1">' + svgNube('rgba(255,255,255,.92)') + '</div>' +
        '<div class="mz-nube mz-nube-2">' + svgNube('rgba(255,255,255,.78)') + '</div>' +
        '<div class="mz-nube mz-nube-3">' + svgNube('rgba(255,255,255,.66)') + '</div>' +
        '<div class="mz-ave" style="top:22%">' + svgAve() + '</div>' +
        '<div class="mz-ave mz-ave-2" style="top:31%">' + svgAve() + '</div>' +
        '<div class="mz-mariposa" style="left:18%;bottom:26%">' + svgMariposa('#F08A5D', '#F4C842') + '</div>' +
        '<div class="mz-mariposa mz-mariposa-2" style="left:64%;bottom:32%">' + svgMariposa('#8FC9E8', '#F7E58A') + '</div>' +
      '</div>' +
      '<div class="mz-motas">' + motas + '</div>' +
      '<div class="mz-colinas mz-colinas-sol"></div>' +
      plantasFila('despierta') +
      grecaPie();
  }

  /* ============================================
     ESCENA: LUNA (Cerrar día)
     Las plantas empiezan despiertas y se duermen.
     ============================================ */
  function escenaLuna() {
    let estrellas = '';
    for (let i = 0; i < 70; i++) {
      const x = _v('lu-ex', i) * 100;
      const y = _v('lu-ey', i) * 62;
      const t = 1 + _v('lu-et', i) * 2.4;
      estrellas += '<span class="mz-estrella" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
                   '%;width:' + t.toFixed(1) + 'px;height:' + t.toFixed(1) +
                   'px;animation-delay:-' + (_v('lu-er', i) * 5).toFixed(1) + 's;animation-duration:' +
                   (2.4 + _v('lu-ed', i) * 3).toFixed(1) + 's"></span>';
    }
    let luciernagas = '';
    for (let i = 0; i < 22; i++) {
      const x = _v('lu-fx', i) * 100;
      const y = 48 + _v('lu-fy', i) * 46;
      luciernagas += '<span class="mz-luciernaga" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) +
                     '%;animation-duration:' + (8 + _v('lu-fd', i) * 8).toFixed(1) + 's,' +
                     (2 + _v('lu-fp', i) * 2.5).toFixed(1) + 's;animation-delay:-' +
                     (_v('lu-fr', i) * 12).toFixed(1) + 's,-' + (_v('lu-fr', i) * 4).toFixed(1) + 's"></span>';
    }
    let zetas = '';
    for (let i = 0; i < 7; i++) {
      const izq = 3 + i * 14.2 + 4;
      zetas += '<span class="mz-zeta" style="left:' + izq.toFixed(1) + '%;animation-delay:' +
               (i * 0.9).toFixed(1) + 's;font-size:' + (18 + (i % 3) * 6) + 'px">' + (i % 2 ? 'z' : 'Z') + '</span>';
    }
    return '' +
      '<div class="mz-cielo mz-cielo-luna"></div>' +
      '<div class="mz-estrellas">' + estrellas + '</div>' +
      '<span class="mz-fugaz"></span><span class="mz-fugaz mz-fugaz-2"></span>' +
      '<div class="mz-capa" data-profundidad="0.02">' +
        '<div class="mz-luna-caja">' +
          '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs><radialGradient id="mzLunaG" cx="40%" cy="38%" r="70%">' +
              '<stop offset="0%" stop-color="#FFFBEA"/><stop offset="70%" stop-color="#EFE6C8"/><stop offset="100%" stop-color="#CFC39B"/>' +
            '</radialGradient>' +
            '<mask id="mzLunaM"><rect width="200" height="200" fill="#fff"/><circle cx="128" cy="86" r="66" fill="#000"/></mask></defs>' +
            '<g mask="url(#mzLunaM)"><circle cx="90" cy="100" r="66" fill="url(#mzLunaG)"/>' +
            '<circle cx="66" cy="90" r="7" fill="#d8ccA4" opacity=".7"/><circle cx="82" cy="126" r="10" fill="#d8ccA4" opacity=".6"/><circle cx="58" cy="118" r="4" fill="#d8ccA4" opacity=".6"/></g>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="mz-capa" data-profundidad="0.05">' +
        '<div class="mz-nube mz-nube-noche mz-nube-1">' + svgNube('rgba(120,130,190,.22)') + '</div>' +
        '<div class="mz-nube mz-nube-noche mz-nube-3">' + svgNube('rgba(120,130,190,.16)') + '</div>' +
      '</div>' +
      '<div class="mz-bruma"></div><div class="mz-bruma mz-bruma-2"></div>' +
      '<div class="mz-motas">' + luciernagas + '</div>' +
      '<div class="mz-colinas mz-colinas-luna"></div>' +
      '<div class="mz-sellos-noche">' +
        '<span class="mz-sello-brilla" style="left:8%"></span><span class="mz-sello-brilla" style="left:88%;animation-delay:-2s"></span>' +
      '</div>' +
      plantasFila('despierta') +
      '<div class="mz-zetas">' + zetas + '</div>' +
      grecaPie();
  }

  /* ============================================
     ESCENA: ESPACIO (Mi espacio)
     Vides que se mecen, espirales de oro que giran y
     sellos con los íconos de cada pestaña flotando.
     ============================================ */
  function svgVid(lado) {
    let hojas = '';
    for (let i = 0; i < 9; i++) {
      const y = 30 + i * 62;
      const x = 34 + Math.sin(i * 0.9) * 14;
      const g = (i % 2 ? 1 : -1);
      hojas += '<path d="M' + x + ' ' + y + ' q ' + (g * 34) + ' -10 ' + (g * 40) + ' -34 q ' + (-g * 30) + ' 2 ' + (-g * 40) + ' 34Z" ' +
               'fill="' + (i % 2 ? '#2F8F4E' : '#48B26A') + '" opacity=".85" class="mz-vid-hoja" style="transform-origin:' + x + 'px ' + y + 'px;animation-delay:-' + (i * 0.6) + 's"/>';
    }
    return '<svg viewBox="0 0 90 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="mz-vid-svg' + (lado === 'd' ? ' espejo' : '') + '">' +
      '<path d="M40 0 C 20 90, 62 150, 34 240 C 14 310, 60 380, 36 470 C 26 520, 44 560, 40 600" stroke="#25703E" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      hojas + '</svg>';
  }

  function svgEspiralOro() {
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="100" cy="100" r="92" fill="none" stroke="#C9982A" stroke-width="3"/>' +
      '<circle cx="100" cy="100" r="80" fill="none" stroke="#C9982A" stroke-width="1.5" stroke-dasharray="4 6"/>' +
      '<path d="M100 100 m0 0 a6 6 0 1 1 6 6 a13 13 0 1 1 -13 -13 a22 22 0 1 1 22 22 a32 32 0 1 1 -32 -32 a42 42 0 1 1 42 42 a52 52 0 1 1 -52 -52" ' +
            'fill="none" stroke="#C9982A" stroke-width="3.5" stroke-linecap="round"/>' +
      '</svg>';
  }

  function escenaEspacio() {
    const sellos = [
      { i: '📝', x: 7,  y: 24, d: 0 },
      { i: '✅', x: 90, y: 36, d: -3 },
      { i: '🎯', x: 5,  y: 58, d: -6 },
      { i: '📅', x: 92, y: 66, d: -9 },
      { i: '📖', x: 10, y: 84, d: -12 },
      { i: '🌿', x: 86, y: 88, d: -5 }
    ];
    let html = '';
    sellos.forEach(function (s, idx) {
      html += '<span class="mz-sello" style="left:' + s.x + '%;top:' + s.y + '%;animation-delay:' + s.d + 's" data-i="' + idx + '">' + s.i + '</span>';
    });
    let motas = '';
    for (let i = 0; i < 16; i++) {
      const t = 3 + _v('es-t', i) * 4;
      motas += '<span class="mz-polen" style="left:' + (_v('es-x', i) * 100).toFixed(1) + '%;top:' + (10 + _v('es-y', i) * 85).toFixed(1) +
               '%;width:' + t.toFixed(1) + 'px;height:' + t.toFixed(1) + 'px;animation-duration:' + (9 + _v('es-d', i) * 9).toFixed(1) +
               's;animation-delay:-' + (_v('es-r', i) * 14).toFixed(1) + 's"></span>';
    }
    return '' +
      '<div class="mz-cielo mz-cielo-espacio"></div>' +
      '<div class="mz-patron"></div>' +
      '<div class="mz-capa" data-profundidad="0.03">' +
        '<div class="mz-oro mz-oro-1">' + svgEspiralOro() + '</div>' +
        '<div class="mz-oro mz-oro-2">' + svgEspiralOro() + '</div>' +
      '</div>' +
      '<div class="mz-vid mz-vid-i">' + svgVid('i') + '</div>' +
      '<div class="mz-vid mz-vid-d">' + svgVid('d') + '</div>' +
      '<div class="mz-capa" data-profundidad="0.06">' + html + '</div>' +
      '<div class="mz-motas">' + motas + '</div>';
  }

  /* ============================================
     ESCENA: PERFIL (Mi Muysca)
     ============================================ */
  function escenaPerfil() {
    let motas = '';
    for (let i = 0; i < 18; i++) {
      const t = 3 + _v('pe-t', i) * 4;
      motas += '<span class="mz-polen" style="left:' + (_v('pe-x', i) * 100).toFixed(1) + '%;top:' + (10 + _v('pe-y', i) * 85).toFixed(1) +
               '%;width:' + t.toFixed(1) + 'px;height:' + t.toFixed(1) + 'px;animation-duration:' + (9 + _v('pe-d', i) * 9).toFixed(1) +
               's;animation-delay:-' + (_v('pe-r', i) * 14).toFixed(1) + 's"></span>';
    }
    return '' +
      '<div class="mz-capa" data-profundidad="0.03">' +
        '<div class="mz-oro mz-oro-1">' + svgEspiralOro() + '</div>' +
        '<div class="mz-oro mz-oro-2">' + svgEspiralOro() + '</div>' +
      '</div>' +
      '<div class="mz-motas">' + motas + '</div>';
  }

  /* ============================================
     MONTAJE
     ============================================ */
  const ESCENAS = { sol: escenaSol, luna: escenaLuna, espacio: escenaEspacio, perfil: escenaPerfil };

  // Inserta la escena como primer hijo de <body>. Devuelve el nodo.
  function montar(tipo) {
    try {
      if (!ESCENAS[tipo]) return null;
      const anterior = document.querySelector('.mz-escena');
      if (anterior) anterior.remove();

      const nodo = document.createElement('div');
      nodo.className = 'mz-escena mz-escena-' + tipo;
      nodo.setAttribute('aria-hidden', 'true');
      nodo.innerHTML = ESCENAS[tipo]();
      document.body.insertBefore(nodo, document.body.firstChild);

      // Paralaje sutil con el mouse (solo capas .mz-capa)
      if (window.zocaAnim && window.zocaAnim.activarParalaje) {
        window.zocaAnim.activarParalaje('.mz-escena .mz-capa');
      }
      return nodo;
    } catch (e) {
      console.error('ZocaEscenas: no se pudo montar la escena "' + tipo + '"', e);
      return null;
    }
  }

  // Las plantas se duermen (o despiertan) con una transición suave
  function dormirPlantas(dormir) {
    document.querySelectorAll('.mz-escena .mz-planta').forEach(function (p, i) {
      setTimeout(function () {
        p.classList.toggle('dormida', !!dormir);
        p.classList.toggle('despierta', !dormir);
      }, i * 260);
    });
    const contenedor = document.querySelector('.mz-escena .mz-plantas');
    if (contenedor) {
      contenedor.classList.toggle('dormidas', !!dormir);
      contenedor.classList.toggle('despiertas', !dormir);
    }
    const zetas = document.querySelector('.mz-escena .mz-zetas');
    if (zetas) zetas.classList.toggle('activas', !!dormir);
  }

  return { montar: montar, dormirPlantas: dormirPlantas, svgPlanta: svgPlanta };
})();

window.ZocaEscenas = ZocaEscenas;
