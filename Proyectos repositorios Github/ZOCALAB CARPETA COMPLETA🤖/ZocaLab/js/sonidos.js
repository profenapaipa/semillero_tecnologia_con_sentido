/* ============================================
   ZOCALAB — Motor de sonido (Web Audio API)
   Todos los efectos se generan por código, sin
   archivos de audio externos ni copyright.
   ============================================ */

class ZocaSound {
  constructor() {
    this.ctx = null;
    this.silenciado = false;
  }

  // El AudioContext solo puede crearse/reanudarse tras un gesto del usuario
  // (política de autoplay de los navegadores), por eso se crea de forma perezosa.
  _obtenerContexto() {
    if (!this.ctx) {
      const AudioContextClase = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClase();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Tono simple con envolvente de ganancia (ataque rápido + caída exponencial)
  _tono(frecuencia, inicio, duracion, tipo = 'sine', ganancia = 0.15) {
    if (this.silenciado) return;
    try {
      const ctx = this._obtenerContexto();
      const t0 = ctx.currentTime + inicio;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(frecuencia, t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(ganancia, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duracion + 0.05);
    } catch (e) {
      console.error('ZocaSound: no se pudo reproducir el tono', e);
    }
  }

  // Deslizamiento de frecuencia (glissando) — usado en click de flashcard e "intentar"
  _deslizar(frecInicial, frecFinal, inicio, duracion, tipo = 'sine', ganancia = 0.15) {
    if (this.silenciado) return;
    try {
      const ctx = this._obtenerContexto();
      const t0 = ctx.currentTime + inicio;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(frecInicial, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(frecFinal, 1), t0 + duracion);

      gain.gain.setValueAtTime(ganancia, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duracion + 0.05);
    } catch (e) {
      console.error('ZocaSound: no se pudo reproducir el deslizamiento', e);
    }
  }

  // ====== Clic suave y burbujeante — para navegación general ======
  click() {
    this._tono(800, 0, 0.08, 'sine', 0.15);
  }

  // ====== Respuesta correcta — ascenso alegre de tres notas ======
  correcto() {
    this._tono(523, 0,    0.15, 'sine', 0.2);
    this._tono(659, 0.13, 0.15, 'sine', 0.2);
    this._tono(784, 0.18, 0.22, 'sine', 0.2);
  }

  // ====== Intento fallido — descenso suave, nunca agresivo ======
  intentar() {
    this._deslizar(400, 300, 0, 0.3, 'sine', 0.12);
  }

  // ====== Nivel completado — secuencia épica de 4 notas ======
  nivelCompleto() {
    const notas = [523, 659, 784, 1047];
    notas.forEach((freq, i) => {
      this._tono(freq, i * 0.18, 0.3, 'sine', 0.25);
      this._tono(freq, i * 0.18, 0.3, 'triangle', 0.1);
    });
  }

  // ====== Flashcard girada — sweep rápido ascendente ======
  flashcard() {
    this._deslizar(300, 600, 0, 0.15, 'sine', 0.1);
  }

  // ====== Logro desbloqueado — arpegio Do-Mi-Sol-Do-Mi ======
  logro() {
    const notas = [523.25, 659.25, 784.00, 1046.50, 1318.51];
    notas.forEach((freq, i) => {
      this._tono(freq, i * 0.08, 0.3, 'sine', 0.2);
    });
  }

  // ====== Botón de navegación — tono breve y discreto ======
  navegar() {
    this._tono(440, 0, 0.06, 'sine', 0.08);
  }

  // ====== Racha activada — vibrato rápido con LFO ======
  racha() {
    if (this.silenciado) return;
    try {
      const ctx = this._obtenerContexto();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t0);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(18, t0);   // velocidad del vibrato
      lfoGain.gain.setValueAtTime(20, t0);    // profundidad del vibrato en Hz
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.15, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0);
      lfo.start(t0);
      osc.stop(t0 + 0.52);
      lfo.stop(t0 + 0.52);
    } catch (e) {
      console.error('ZocaSound: no se pudo reproducir la racha', e);
    }
  }

  // Silencia/reactiva todos los efectos (el reproductor de música es independiente)
  silenciar(valor) {
    this.silenciado = valor;
  }
}

const zocaSound = new ZocaSound();
window.zocaSound = zocaSound;

// Sonido de clic en absolutamente todos los botones de la app (delegación global,
// funciona también con botones agregados dinámicamente después de cargar la página)
document.addEventListener('click', (e) => {
  const objetivo = e.target.closest('button, .btn, [role="button"]');
  if (objetivo) zocaSound.click();
});
