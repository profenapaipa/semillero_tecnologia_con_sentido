/* ===========================================================
   sitio.js — lo poco que la página necesita que corra
   ===========================================================
   Dos cosas, nada más:

     1. Marcar en el mapa fijo la sección que se está mirando.
     2. Filtrar los proyectos con el buscador del portal.
     3. Hacer aparecer los bloques al desplazar.
     4. Cargar el reproductor de YouTube solo cuando alguien pulsa.
     5. Cerrar los menus desplegables al salirse o con Escape.
     6. Mover el carrusel de diapositivas (Swiper).
     7. Animar las secciones al bajar (GSAP ScrollTrigger).

   Las dos librerias se eligieron por una razon concreta: ninguna esconde
   contenido desde el CSS. Si no cargan, la pagina se ve completa, solo que
   quieta. Librerias como AOS ponen opacity:0 en la hoja de estilo, y si su
   JavaScript falla la pagina queda en blanco.

   No se usa ninguna librería a propósito. Son unas pocas líneas con las
   herramientas del navegador, y si este archivo no carga la página sigue
   funcionando completa: el contenido no depende de JavaScript, y la clase
   .no-js del <body> ya deja todo visible.
   =========================================================== */

(function () {
  'use strict';

  /* ---- 1. Dónde estoy: resalta en el mapa la sección visible ---- */
  var mapa = document.getElementById('mapa-secciones');
  if (mapa && 'IntersectionObserver' in window) {
    var enlaces = {};
    Array.prototype.forEach.call(mapa.querySelectorAll('a[data-seccion]'), function (a) {
      enlaces[a.getAttribute('data-seccion')] = a;
    });

    var visibles = {};
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (ent) {
        visibles[ent.target.id] = ent.isIntersecting ? ent.intersectionRatio : 0;
      });
      // Gana la sección con más superficie a la vista.
      var mejor = null, mayor = 0;
      Object.keys(visibles).forEach(function (id) {
        if (visibles[id] > mayor) { mayor = visibles[id]; mejor = id; }
      });
      Object.keys(enlaces).forEach(function (id) {
        enlaces[id].classList.toggle('activa', id === mejor);
      });
    }, { rootMargin: '-180px 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75] });

    Object.keys(enlaces).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) { observador.observe(sec); }
    });
  }


  /* ---- 3. Buscador de proyectos ---- */
  var caja = document.getElementById('q');
  if (caja) {
    var tarjetas = Array.prototype.slice.call(document.querySelectorAll('a.equipo[data-buscar]'));
    var grupos = Array.prototype.slice.call(document.querySelectorAll('[data-grupo]'));
    var estado = document.getElementById('q-estado');
    var vacio = document.getElementById('q-vacio');
    var limpiar = document.getElementById('q-limpiar');
    var total = tarjetas.length;

    // Sin tildes y en minusculas, para que "animacion" encuentre "animación".
    function normal(t) {
      return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    tarjetas.forEach(function (t) { t._clave = normal(t.getAttribute('data-buscar')); });

    function filtrar() {
      var q = normal(caja.value.trim());
      var visibles = 0;
      tarjetas.forEach(function (t) {
        var pasa = !q || q.split(/\s+/).every(function (parte) {
          return t._clave.indexOf(parte) !== -1;
        });
        t.hidden = !pasa;
        if (pasa) { visibles++; }
      });
      // Una linea tecnica se esconde si ninguno de los suyos quedo visible.
      grupos.forEach(function (g) {
        var algunos = g.querySelectorAll('a.equipo:not([hidden])').length;
        g.hidden = algunos === 0;
      });
      if (estado) {
        estado.textContent = q
          ? (visibles === 1 ? '1 proyecto encontrado' : visibles + ' proyectos encontrados')
          : total + ' proyectos';
      }
      if (vacio) { vacio.hidden = visibles !== 0; }
      if (limpiar) { limpiar.hidden = !q; }
    }

    caja.addEventListener('input', filtrar);
    caja.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { caja.value = ''; filtrar(); }
    });
    if (limpiar) {
      limpiar.addEventListener('click', function () { caja.value = ''; filtrar(); caja.focus(); });
    }
    // La barra puede traer texto si el navegador lo recordo al recargar.
    filtrar();
  }


  /* ---- 5. Videos: cargar el reproductor solo al hacer clic ---- */
  /* Hasta que alguien pulsa, en la pagina solo hay una imagen. Asi una
     pagina con varios videos sigue cargando rapido, y YouTube no rastrea
     a quien no los vio. */
  document.addEventListener('click', function (ev) {
    var boton = ev.target.closest && ev.target.closest('.lienzo-video[data-video]');
    if (!boton) { return; }
    var id = boton.getAttribute('data-video');
    var marco = document.createElement('iframe');
    marco.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    marco.title = boton.getAttribute('aria-label') || 'Video';
    marco.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
    marco.allowFullscreen = true;
    boton.innerHTML = '';
    boton.appendChild(marco);
    boton.removeAttribute('data-video');
  });

  /* ---- 6. Un solo desplegable abierto a la vez ---- */
  var menus = document.querySelectorAll('.barra details.desplegable');
  Array.prototype.forEach.call(menus, function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) { return; }
      Array.prototype.forEach.call(menus, function (otro) {
        if (otro !== d) { otro.open = false; }
      });
    });
  });
  document.addEventListener('click', function (ev) {
    Array.prototype.forEach.call(menus, function (d) {
      if (d.open && !d.contains(ev.target)) { d.open = false; }
    });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') { return; }
    Array.prototype.forEach.call(menus, function (d) { d.open = false; });
  });


  /* ---- 7. Carrusel de diapositivas, con Swiper ---- */
  /* Se usa una libreria solo aqui. Un carrusel accesible de verdad es mucho
     trabajo: teclado, gestos, foco, miniaturas sincronizadas y carga
     diferida. Si Swiper no carga, las diapositivas se ven igual, una debajo
     de otra: el HTML no depende de el. */
  if (window.Swiper) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-carrusel]'), function (caja) {
      var principal = caja.querySelector('.principal-swiper');
      var tira = caja.querySelector('.miniaturas-swiper');
      if (!principal) { return; }
      var swTira = tira ? new Swiper(tira, {
        slidesPerView: 'auto',
        spaceBetween: 8,
        freeMode: true,
        watchSlidesProgress: true
      }) : null;
      new Swiper(principal, {
        spaceBetween: 12,
        keyboard: { enabled: true },
        navigation: {
          nextEl: principal.querySelector('.swiper-button-next'),
          prevEl: principal.querySelector('.swiper-button-prev')
        },
        pagination: {
          el: principal.querySelector('.swiper-pagination'),
          type: 'fraction'
        },
        thumbs: swTira ? { swiper: swTira } : undefined
      });
    });
  }

  /* ---- 8. Movimiento al desplazar, con GSAP ScrollTrigger ---- */
  /* Al reves que otras librerias de scroll, GSAP no esconde nada desde el
     CSS: el estado inicial lo pone el script. Si el script no corre, la
     pagina se ve completa. Esa es la razon de elegirlo. */
  var quietos2 = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && window.ScrollTrigger && !quietos2) {
    gsap.registerPlugin(ScrollTrigger);

    function entra(sel, desde, extra) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        gsap.from(el, Object.assign({
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          duration: 0.6, ease: 'power2.out'
        }, desde, extra || {}));
      });
    }

    // Cabeceras de seccion: entran desde abajo.
    entra('.cab-seccion', { y: 26, opacity: 0 });
    // Tarjetas y modulos: en cascada corta, no todas a la vez.
    Array.prototype.forEach.call(
      document.querySelectorAll('.rejilla, .modulos, .intro, .rejilla-equipos'),
      function (grupo) {
        var hijos = grupo.children;
        if (!hijos.length) { return; }
        gsap.from(hijos, {
          scrollTrigger: { trigger: grupo, start: 'top 85%', once: true },
          y: 22, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out'
        });
      });
    // Las paradas del camino: aparecen una tras otra, como un recorrido.
    Array.prototype.forEach.call(document.querySelectorAll('.camino'), function (c) {
      gsap.from(c.children, {
        scrollTrigger: { trigger: c, start: 'top 80%', once: true },
        scale: 0.7, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'back.out(1.6)'
      });
    });
    // Las barras de progreso se llenan al entrar, no aparecen llenas.
    Array.prototype.forEach.call(document.querySelectorAll('.barra-progreso > span'), function (b) {
      var ancho = b.style.width;
      gsap.fromTo(b, { width: '0%' }, {
        width: ancho, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: b, start: 'top 92%', once: true }
      });
    });
    // Paralaje suave de la reticula del panel oscuro.
    Array.prototype.forEach.call(document.querySelectorAll('.portada'), function (pz) {
      gsap.to(pz, {
        backgroundPositionY: '70px', ease: 'none',
        scrollTrigger: { trigger: pz, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    // El numero gigante del nivel actual se mueve un poco mas lento.
    Array.prototype.forEach.call(document.querySelectorAll('.nivel-actual .gigante'), function (g) {
      gsap.to(g, {
        y: -26, ease: 'none',
        scrollTrigger: { trigger: g.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---- 4. Aparecer al desplazar, respaldo sin librerias ---- */
  var porRevelar = document.querySelectorAll('.revelar');
  if (!porRevelar.length) { return; }

  var quietos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quietos || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(porRevelar, function (el) { el.classList.add('visible'); });
    return;
  }

  var aparecer = new IntersectionObserver(function (entradas, obs) {
    entradas.forEach(function (ent) {
      if (!ent.isIntersecting) { return; }
      ent.target.classList.add('visible');
      obs.unobserve(ent.target);   // una vez visible, se deja en paz
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

  Array.prototype.forEach.call(porRevelar, function (el, i) {
    // Un escalonado corto para que una rejilla no aparezca de golpe.
    el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
    aparecer.observe(el);
  });
}());
