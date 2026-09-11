/**
 * arc-dial.js — Componente interactivo de Dial Curvo en Arco (Gauge Retro-Futurista)
 * 
 * Implementa el control temporal arqueado idéntico al diseño de web-ui-preview.jpg:
 * Ticks gruesos tipo cápsula con neón cian/ámbar, perilla vertical luminosa,
 * etiquetas de años curvadas y sincronización accesible con <input type="range">.
 */

import { CHRONO_BOUNDS } from './constants.js';

export class ArcChronoDial {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Contenedor donde se monta el SVG
   * @param {HTMLInputElement} [options.syncInput] - Input tipo range nativo a sincronizar
   * @param {number} [options.minYear] - Año mínimo (default CHRONO_BOUNDS.MIN_YEAR = 1940)
   * @param {number} [options.maxYear] - Año máximo (default CHRONO_BOUNDS.MAX_YEAR = 2026)
   * @param {number} [options.initialYear] - Año inicial (default 1994)
   * @param {Function} [options.onChange] - Callback (year) => void
   */
  constructor(options = {}) {
    this.container = options.container;
    this.syncInput = options.syncInput || null;
    this.minYear = options.minYear || CHRONO_BOUNDS.MIN_YEAR;
    this.maxYear = options.maxYear || CHRONO_BOUNDS.MAX_YEAR;
    this.currentYear = options.initialYear || 1994;
    this.onChange = options.onChange || null;

    this.numTicks = 38; // Ticks gruesos a lo largo del arco como en la imagen

    // Parámetros geométricos del arco (ViewBox 640 x 170)
    this.viewBoxWidth = 640;
    this.viewBoxHeight = 170;
    this.centerX = 320;
    this.centerY = 460;
    this.radius = 360;

    // Ángulos en radianes (arco convexo hacia arriba)
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
      
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Ticks gruesos tipo cápsula (~24px de largo)
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

    svg.innerHTML = `
      <defs>
        <filter id="neon-cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-amber-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="amber-knob-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="50%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ea580c" />
        </linearGradient>
      </defs>
      
      <!-- Carril de soporte curvo -->
      <path class="arc-rail-bg" d="${this.buildRailPath()}" />

      <!-- Grupo de marcas / ticks tipo cápsula -->
      <g class="arc-ticks-group"></g>

      <!-- Grupo de etiquetas numéricas guía -->
      <g class="arc-labels-group"></g>

      <!-- Perilla / Thumb Cápsula vertical luminosa -->
      <g class="arc-knob-group" cursor="grab">
        <rect class="arc-knob-pill" rx="7" ry="7" width="16" height="34" />
        <line class="arc-knob-notch" x1="0" y1="-8" x2="0" y2="8" />
      </g>
    `;

    this.elements.svg = svg;
    this.elements.ticksGroup = svg.querySelector('.arc-ticks-group');
    this.elements.labelsGroup = svg.querySelector('.arc-labels-group');
    this.elements.knobGroup = svg.querySelector('.arc-knob-group');

    // Generar elementos de ticks gruesos
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
    
    // Generar marcas de año espaciadas a lo largo de la curva como en un velocímetro
    // Por ejemplo: 1990, 1992, etc. o rangos contextuales simétricos
    const cur = this.currentYear;
    const labelOffsets = [-6, -4, -2, 2, 4, 6];
    
    // Tomar 6 puntos a lo largo de la curva para situar etiquetas bien visibles
    const labelSteps = [0.08, 0.23, 0.38, 0.62, 0.77, 0.92];
    
    labelSteps.forEach((t, idx) => {
      const angle = this.startAngle + t * (this.endAngle - this.startAngle);
      const rLabel = this.radius + 34;
      const lx = this.centerX + rLabel * Math.cos(angle);
      const ly = this.centerY + rLabel * Math.sin(angle);

      // Calcular año contextual para la etiqueta
      const offsetYear = cur + (labelOffsets[idx] || 0);
      const displayYear = Math.max(this.minYear, Math.min(this.maxYear, offsetYear));

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx.toFixed(1));
      text.setAttribute('y', ly.toFixed(1));
      text.setAttribute('class', 'arc-rail-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = displayYear;
      this.elements.labelsGroup.appendChild(text);
    });
  }

  setYear(year, emit = true) {
    const clamped = Math.max(this.minYear, Math.min(this.maxYear, Math.round(year)));
    const changed = (this.currentYear !== clamped);
    this.currentYear = clamped;

    const t = (clamped - this.minYear) / (this.maxYear - this.minYear);
    const angle = this.startAngle + t * (this.endAngle - this.startAngle);

    // Posición del knob centrado sobre la curvatura
    const kx = this.centerX + this.radius * Math.cos(angle);
    const ky = this.centerY + this.radius * Math.sin(angle);
    const deg = (angle * 180) / Math.PI + 90;

    if (this.elements.knobGroup) {
      this.elements.knobGroup.setAttribute(
        'transform',
        `translate(${kx.toFixed(1)}, ${ky.toFixed(1)}) rotate(${deg.toFixed(1)}) translate(-8, -17)`
      );
    }

    // Colorear ticks exactamente como en web-ui-preview.jpg:
    // - Izquierda: Cian brillante con resplandor
    // - En el centro (cercano al knob): Ámbar brillante con resplandor
    // - Derecha: Pizarra oscura / inactiva
    const activeIndex = Math.round(t * (this.numTicks - 1));
    this.tickElements.forEach((el, idx) => {
      el.classList.remove('tick-cyan', 'tick-amber', 'tick-inactive');
      if (idx < activeIndex - 1) {
        el.classList.add('tick-cyan');
      } else if (Math.abs(idx - activeIndex) <= 2) {
        el.classList.add('tick-amber');
      } else {
        el.classList.add('tick-inactive');
      }
    });

    if (changed) {
      this.renderYearLabels();
    }

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
      const scaleX = this.viewBoxWidth / rect.width;
      const scaleY = this.viewBoxHeight / rect.height;
      const px = (clientX - rect.left) * scaleX;
      const py = (clientY - rect.top) * scaleY;

      const dx = px - this.centerX;
      const dy = py - this.centerY;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;

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

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      this.setYear(this.currentYear + delta, true);
    }, { passive: false });

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
