/* ============================================
   ZOCALAB — Utilidades de animación
   Confeti, efecto ripple, toasts de logro,
   transiciones entre páginas y partículas de
   fondo. Se apoya en las clases y keyframes
   definidos en css/estudio.css.
   ============================================ */

// ====== EFECTO CONFETI ======
// Crea "cantidad" partículas de colores de la paleta ZocaLab cayendo
// desde arriba. Se usa al completar una lección o desbloquear un logro.
function lanzarConfeti(cantidad = 40) {
  try {
    const colores = ['#1B5E3B', '#2D9B5A', '#C9982A', '#C4522A', '#2B7EA1', '#F2EDE0'];
    const contenedor = document.createElement('div');
    contenedor.className = 'zl-confeti-contenedor';
    document.body.appendChild(contenedor);

    for (let i = 0; i < cantidad; i++) {
      const pieza = document.createElement('div');
      const esRedonda = Math.random() > 0.5;
      const tamano = 6 + Math.random() * 6;

      pieza.className = 'zl-confeti-pieza' + (esRedonda ? ' redonda' : '');
      pieza.style.left = `${Math.random() * 100}%`;
      pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
      pieza.style.width = `${tamano}px`;
      pieza.style.height = `${tamano}px`;
      pieza.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      pieza.style.animationDelay = `${Math.random() * 0.4}s`;
      contenedor.appendChild(pieza);
    }

    setTimeout(() => contenedor.remove(), 3200);
  } catch (e) {
    console.error('Error al lanzar el confeti:', e);
  }
}

// ====== EFECTO RIPPLE EN BOTONES ======
// Delegación global: cualquier .btn o .zl-clic genera un círculo que se
// expande desde el punto exacto del clic.
document.addEventListener('click', (e) => {
  try {
    const objetivo = e.target.closest('.btn, .zl-clic');
    if (!objetivo) return;

    const rect = objetivo.getBoundingClientRect();
    const diametro = Math.max(rect.width, rect.height);
    const radio = diametro / 2;
    const clicX = e.clientX || rect.left + rect.width / 2;
    const clicY = e.clientY || rect.top + rect.height / 2;

    const span = document.createElement('span');
    span.className = 'zl-ripple';
    span.style.width = `${diametro}px`;
    span.style.height = `${diametro}px`;
    span.style.left = `${clicX - rect.left - radio}px`;
    span.style.top = `${clicY - rect.top - radio}px`;

    objetivo.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  } catch (err) {
    console.error('Error generando el ripple:', err);
  }
});

// ====== TOAST DE LOGRO DESBLOQUEADO ======
// Muestra una notificación en la esquina superior derecha con el ícono
// y nombre del logro. Suena zocaSound.logro() si el motor está cargado.
function mostrarToastLogro({ icono = '🏆', nombre = 'Nuevo logro', descripcion = '' } = {}) {
  try {
    const anterior = document.querySelector('.zl-toast-logro');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.className = 'zl-toast-logro';
    toast.innerHTML = `
      <span class="zl-toast-icono" aria-hidden="true">${icono}</span>
      <div>
        <div class="zl-toast-titulo">¡Insignia desbloqueada!</div>
        <div class="zl-toast-texto">${nombre}${descripcion ? ' — ' + descripcion : ''}</div>
      </div>
    `;
    document.body.appendChild(toast);

    if (window.zocaSound) zocaSound.logro();

    setTimeout(() => {
      toast.classList.add('zl-toast-saliendo');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  } catch (e) {
    console.error('Error mostrando el toast de logro:', e);
  }
}

// ====== AVISO GENÉRICO (misma estética que el toast de logro) ======
// A diferencia de mostrarToastLogro(), el título es configurable: sirve
// para recordatorios (ej. una meta próxima a vencer) sin decir "insignia
// desbloqueada" cuando en realidad no se desbloqueó nada.
function mostrarAviso({ icono = '💡', titulo = 'Aviso', texto = '' } = {}) {
  try {
    const anterior = document.querySelector('.zl-toast-logro');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.className = 'zl-toast-logro';
    toast.innerHTML = `
      <span class="zl-toast-icono" aria-hidden="true">${icono}</span>
      <div>
        <div class="zl-toast-titulo">${titulo}</div>
        <div class="zl-toast-texto">${texto}</div>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('zl-toast-saliendo');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  } catch (e) {
    console.error('Error mostrando el aviso:', e);
  }
}

// ====== TRANSICIÓN ENTRE PÁGINAS ======
// fadeOut de la página actual (0.3s) y luego navega. La página destino
// hace su propio fadeIn con la animación "fadeIn" que ya traen sus body.
function navegarConTransicion(url) {
  try {
    document.body.style.animation = 'fadePageOut 0.3s ease forwards';
  } catch (e) { /* si falla la animación, igual navegamos */ }
  setTimeout(() => { window.location.href = url; }, 300);
}

// ====== PARTÍCULAS DE FONDO SUTILES ======
// Puntos dorados flotando muy lento. Si se pasa "simbolos" (array de
// emoji/texto), cada partícula muestra uno de esos símbolos en vez del
// punto — así una página puede pedir partículas con temática propia
// (ej. rana dorada, espiral, destello) sin duplicar esta función.
function crearParticulasFondo(cantidad = 15, simbolos = null) {
  try {
    if (document.querySelector('.zl-particulas')) return;

    const contenedor = document.createElement('div');
    contenedor.className = 'zl-particulas';

    for (let i = 0; i < cantidad; i++) {
      const particula = document.createElement('div');
      particula.className = 'zl-particula' + (simbolos && simbolos.length ? ' zl-particula-simbolo' : '');
      if (simbolos && simbolos.length) {
        particula.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
        particula.setAttribute('aria-hidden', 'true');
      }
      particula.style.left = `${Math.random() * 100}%`;
      particula.style.top = `${Math.random() * 100}%`;
      particula.style.animationDuration = `${10 + Math.random() * 10}s`;
      particula.style.animationDelay = `${Math.random() * 6}s`;
      contenedor.appendChild(particula);
    }

    document.body.insertBefore(contenedor, document.body.firstChild);
  } catch (e) {
    console.error('Error creando las partículas de fondo:', e);
  }
}

// ====== FONDO CON PARALAJE AL MOVER EL MOUSE ======
// Todo elemento que haga match con selectorCapas se desplaza siguiendo
// al mouse. Cada capa controla su propia intensidad con el atributo
// data-profundidad (0 = quieta, valores típicos 0.02-0.08); si no lo
// trae, se usa 0.04. Pensada para capas decorativas fixed/absolute que
// no afectan el layout (usan transform, no reposicionan el documento).
function activarParalaje(selectorCapas) {
  try {
    const capas = document.querySelectorAll(selectorCapas);
    if (!capas.length) return;

    document.addEventListener('mousemove', (e) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2;   // -1..1
      const py = (e.clientY / window.innerHeight - 0.5) * 2;  // -1..1

      capas.forEach((capa) => {
        const profundidad = Number(capa.dataset.profundidad) || 0.04;
        const x = px * profundidad * 100;
        const y = py * profundidad * 100;
        capa.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
    });
  } catch (e) {
    console.error('Error activando el paralaje:', e);
  }
}

// Agrupadas también en un objeto para quien prefiera importarlas con namespace
window.zocaAnim = {
  lanzarConfeti,
  mostrarToastLogro,
  mostrarAviso,
  navegarConTransicion,
  crearParticulasFondo,
  activarParalaje
};
