/**
 * arc-dial.js — Componente interactivo de Dial Curvo en Arco (Gauge Retro-Futurista)
 * 
 * Implementa el control temporal arqueado con ticks luminiscentes de neón (cian / ámbar / gris),
 * perilla tipo cápsula luminosa, soporte táctil/puntero y sincronización accesible con <input type="range">.
 */

import { CHRONO_BOUNDS } from './constants.js';

export class ArcChronoDial {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Contenedor donde se monta el SVG
   * @param {HTMLInputElement} [options.syncInput] - Input tipo range nativo a sincronizar
   * @param {number} [options.minYear] - Año mínimo (default CHRONO_BOUNDS.MIN_YEAR = 1940)
   * @param {number} [options.maxYear] - Año máximo (default CHRONO_BOUNDS.MAX_YEAR = 2026)
   * @param {number} [options.initialYear] - Año inicial (default 1990)
   * @param {Function} [options.onChange] - Callback (year) => void
   */
  constructor(options = {}) {
    this.container = options.container;
    this.syncInput = options.syncInput || null;
    this.minYear = options.minYear || CHRONO_BOUNDS.MIN_YEAR;
    this.maxYear = options.maxYear || CHRONO_BOUNDS.MAX_YEAR;
    this.currentYear = options.initialYear || 1990;
    this.onChange = options.onChange || null;

    this.numTicks = 42; // Ticks a lo largo del arco
    this.isDragging = false;

    // Parámetros geométricos del arco (ViewBox 600 x 140)
    this.viewBoxWidth = 600;
    this.viewBoxHeight = 135;
    this.centerX = 300;
    this.centerY = 440;
    this.radius = 370;

    // Ángulos en radianes (arco convexo hacia arriba, centrado en el meridiano superior)
    // -PI/2 es la cima (270deg). El arco va de ~232deg a ~308deg.
    this.startAngle = (230 * Math.PI) / 180;
    this.endAngle = (310 * Math.PI) / 180;

    this.ticksData = [];
    this.elements = {};

    this.init();
  }

  init() {
    if (!this.container) return;
    this.precomputeGeometry();
    this.render();
    this.bindEvents();
    this.setYear(this.currentYear, false);
  }

  precomputeGeometry() {
    this.ticksData = [];
    for (let i = 0; i < this.numTicks; i++) {
      const t = i / (this.numTicks - 1);
      const angle = this.startAngle + t * (this.endAngle - this.startAngle);
      
      // Coordenadas a lo largo del radio
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const rInner = this.radius - 12;
      const rOuter = this.radius + 12;

      const x1 = this.centerX + rInner * cosA;
      const y1 = this.centerY + rInner * sinA;
      const x2 = this.centerX + rOuter * cosA;
      const y2 = this.centerY + rOuter * sinA;

      const midX = this.centerX + this.radius * cosA;
      const midY = this.centerY + this.radius * sinA;

      this.ticksData.push({
        index: i,
        t,
        x1, y1, x2, y2,
        midX, midY,
        angle
      });
    }
  }

  render() {
    this.container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`);
    svg.setAttribute('class', 'arc-dial-svg');
    svg.setAttribute('role', 'presentation');

    // Filtros para resplandor de neón (Cyan y Amber)
    svg.innerHTML = `
      <defs>
        <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-glow-amber" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4.5" result="blur1" />
          <feGaussianBlur stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="knob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="45%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      
      <!-- Carril de fondo tenue del arco -->
      <path class="arc-rail-bg" d="${this.buildRailPath()}" />

      <!-- Grupo de marcas / ticks -->
      <g class="arc-ticks-group"></g>

      <!-- Grupo de etiquetas de años -->
      <g class="arc-labels-group"></g>

      <!-- Perilla / Thumb tipo cápsula -->
      <g class="arc-knob-group" cursor="grab">
        <rect class="arc-knob-pill" rx="6" ry="6" width="14" height="34" />
        <line class="arc-knob-centerline" x1="0" y1="-8" x2="0" y2="8" />
      </g>
    `;

    this.elements.svg = svg;
    this.elements.ticksGroup = svg.querySelector('.arc-ticks-group');
    this.elements.labelsGroup = svg.querySelector('.arc-labels-group');
    this.elements.knobGroup = svg.querySelector('.arc-knob-group');
    this.elements.knobPill = svg.querySelector('.arc-knob-pill');

    // Generar elementos de ticks
    this.tickElements = this.ticksData.map(d => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', d.x1.toFixed(1));
      line.setAttribute('y1', d.y1.toFixed(1));
      line.setAttribute('x2', d.x2.toFixed(1));
      line.setAttribute('y2', d.y2.toFixed(1));
      line.setAttribute('class', 'arc-tick');
      this.elements.ticksGroup.appendChild(line);
      return line;
    });

    // Generar etiquetas de año (marcas guía a lo largo de la curva)
    this.renderYearLabels();

    this.container.appendChild(svg);
  }

  buildRailPath() {
    const first = this.ticksData[0];
    const last = this.ticksData[this.ticksData.length - 1];
    return `M ${first.midX.toFixed(1)} ${first.midY.toFixed(1)} A ${this.radius} ${this.radius} 0 0 1 ${last.midX.toFixed(1)} ${last.midY.toFixed(1)}`;
  }

  renderYearLabels() {
    this.elements.labelsGroup.innerHTML = '';
    // Marcadores clave espaciados: 1940, 1960, 1980, 2000, 2026
    const keyYears = [1940, 1960, 1980, 2000, 2026];
    
    keyYears.forEach(y => {
      const t = (y - this.minYear) / (this.maxYear - this.minYear);
      const angle = this.startAngle + t * (this.endAngle - this.startAngle);
      // Radio exterior para etiquetas
      const rLabel = this.radius + 28;
      const lx = this.centerX + rLabel * Math.cos(angle);
      const ly = this.centerY + rLabel * Math.sin(angle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx.toFixed(1));
      text.setAttribute('y', ly.toFixed(1));
      text.setAttribute('class', 'arc-rail-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = y;
      this.elements.labelsGroup.appendChild(text);
    });
  }

  setYear(year, emit = true) {
    const clamped = Math.max(this.minYear, Math.min(this.maxYear, Math.round(year)));
    this.currentYear = clamped;

    const t = (clamped - this.minYear) / (this.maxYear - this.minYear);
    const angle = this.startAngle + t * (this.endAngle - this.startAngle);

    // Posición del knob
    const kx = this.centerX + this.radius * Math.cos(angle);
    const ky = this.centerY + this.radius * Math.sin(angle);
    const deg = (angle * 180) / Math.PI + 90; // Orientar normal a la tangente

    if (this.elements.knobGroup) {
      this.elements.knobGroup.setAttribute(
        'transform',
        `translate(${kx.toFixed(1)}, ${ky.toFixed(1)}) rotate(${deg.toFixed(1)}) translate(-7, -17)`
      );
    }

    // Colorear ticks dinámicamente según la posición del cursor
    const activeIndex = Math.round(t * (this.numTicks - 1));
    this.tickElements.forEach((el, idx) => {
      el.classList.remove('tick-cyan', 'tick-amber', 'tick-inactive');
      if (idx < activeIndex - 1) {
        el.classList.add('tick-cyan');
      } else if (Math.abs(idx - activeIndex) <= 1) {
        el.classList.add('tick-amber');
      } else {
        el.classList.add('tick-inactive');
      }
    });

    // Sincronizar input range subyacente si existe
    if (this.syncInput && parseInt(this.syncInput.value, 10) !== clamped) {
      this.syncInput.value = clamped;
    }

    if (emit && typeof this.onChange === 'function') {
      this.onChange(clamped);
    }
  }

  bindEvents() {
    const svg = this.elements.svg;
    if (!svg) return;

    const handlePointer = (clientX, clientY) => {
      const rect = svg.getBoundingClientRect();
      // Mapear coordenadas de pantalla a espacio de ViewBox (600 x 140)
      const scaleX = this.viewBoxWidth / rect.width;
      const scaleY = this.viewBoxHeight / rect.height;
      const px = (clientX - rect.left) * scaleX;
      const py = (clientY - rect.top) * scaleY;

      // Calcular ángulo respecto al centro geométrico del arco
      const dx = px - this.centerX;
      const dy = py - this.centerY;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;

      // Normalizar t entre startAngle y endAngle
      let t = (angle - this.startAngle) / (this.endAngle - this.startAngle);
      t = Math.max(0, Math.min(1, t));

      const calculatedYear = Math.round(this.minYear + t * (this.maxYear - this.minYear));
      if (calculatedYear !== this.currentYear) {
        this.setYear(calculatedYear, true);
      }
    };

    svg.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      svg.setPointerCapture(e.pointerId);
      svg.style.cursor = 'grabbing';
      handlePointer(e.clientX, e.clientY);
    });

    svg.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      handlePointer(e.clientX, e.clientY);
    });

    const endDrag = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        svg.releasePointerCapture(e.pointerId);
      } catch (_) {}
      svg.style.cursor = 'default';
    };

    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);

    // Rueda del ratón sobre el dial
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      this.setYear(this.currentYear + delta, true);
    }, { passive: false });

    // Si el input range nativo cambia externamente, sincronizar
    if (this.syncInput) {
      this.syncInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val !== this.currentYear) {
          this.setYear(val, false);
        }
      });
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
