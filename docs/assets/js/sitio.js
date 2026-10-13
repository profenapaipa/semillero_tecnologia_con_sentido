/* ===========================================================
   sitio.js — lo poco que la página necesita que corra
   ===========================================================
   Dos cosas, nada más:

     1. Marcar en el mapa fijo la sección que se está mirando.
     2. Hacer aparecer los bloques al desplazar.

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

  /* ---- 2. Aparecer al desplazar ---- */
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
