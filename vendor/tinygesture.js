/**
 * TinyGesture.js
 * Lightweight, zero-dependency touch gesture recognition (swipe, tap, doubletap)
 * MIT License
 */
(function (root) {
  'use strict';

  class TinyGesture {
    constructor(element, options = {}) {
      this.element = element;
      this.options = Object.assign({
        threshold: (type) => Math.max(25, Math.floor(0.15 * (type === 'x' ? window.innerWidth : window.innerHeight))),
        velocityThreshold: 5,
        disregardVelocityThreshold: (type) => Math.floor(0.5 * (type === 'x' ? window.innerWidth : window.innerHeight)),
        pressThreshold: 8,
        diagonalSwipes: false,
        diagonalLimit: Math.tan(45 * 1.5 / 180 * Math.PI),
        mouseSupport: false
      }, options);

      this.handlers = {};
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.touchMoveX = 0;
      this.touchMoveY = 0;
      this.touchEndX = 0;
      this.touchEndY = 0;
      this.swipingDirection = null;
      this.swipingHorizontal = false;
      this.swipingVertical = false;
      this.touchStartTime = 0;
      this.lastTapTimestamp = 0;

      this._onTouchStart = this.onTouchStart.bind(this);
      this._onTouchMove = this.onTouchMove.bind(this);
      this._onTouchEnd = this.onTouchEnd.bind(this);

      this.element.addEventListener('touchstart', this._onTouchStart, { passive: true });
      this.element.addEventListener('touchmove', this._onTouchMove, { passive: true });
      this.element.addEventListener('touchend', this._onTouchEnd, { passive: true });
      this.element.addEventListener('touchcancel', this._onTouchEnd, { passive: true });

      if (this.options.mouseSupport) {
        this._onMouseDown = (e) => {
          if (e.button !== 0) return;
          this.isMouseDown = true;
          this.onTouchStart(e);
        };
        this._onMouseMove = (e) => {
          if (!this.isMouseDown) return;
          this.onTouchMove(e);
        };
        this._onMouseUp = (e) => {
          if (!this.isMouseDown) return;
          this.isMouseDown = false;
          this.onTouchEnd(e);
        };
        this.element.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
      }
    }

    on(type, fn) {
      if (!this.handlers[type]) this.handlers[type] = [];
      this.handlers[type].push(fn);
      return this;
    }

    off(type, fn) {
      if (!this.handlers[type]) return this;
      this.handlers[type] = this.handlers[type].filter(h => h !== fn);
      return this;
    }

    trigger(type, data) {
      if (this.handlers[type]) {
        this.handlers[type].forEach(fn => fn(data));
      }
    }

    onTouchStart(event) {
      const touch = event.touches ? event.touches[0] : event;
      this.touchStartX = touch.clientX !== undefined ? touch.clientX : (touch.screenX || 0);
      this.touchStartY = touch.clientY !== undefined ? touch.clientY : (touch.screenY || 0);
      this.touchMoveX = this.touchStartX;
      this.touchMoveY = this.touchStartY;
      this.touchStartTime = Date.now();
      this.swipingDirection = null;
      this.swipingHorizontal = false;
      this.swipingVertical = false;
      this.trigger('panstart', event);
    }

    onTouchMove(event) {
      const touch = event.touches ? event.touches[0] : event;
      this.touchMoveX = touch.clientX !== undefined ? touch.clientX : (touch.screenX || 0);
      this.touchMoveY = touch.clientY !== undefined ? touch.clientY : (touch.screenY || 0);

      const deltaX = this.touchMoveX - this.touchStartX;
      const deltaY = this.touchMoveY - this.touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (!this.swipingDirection && (absDeltaX > 8 || absDeltaY > 8)) {
        if (absDeltaX > absDeltaY) {
          this.swipingHorizontal = true;
          this.swipingDirection = deltaX < 0 ? 'left' : 'right';
        } else {
          this.swipingVertical = true;
          this.swipingDirection = deltaY < 0 ? 'up' : 'down';
        }
      }

      this.trigger('panmove', event);
    }

    onTouchEnd(event) {
      const deltaX = this.touchMoveX - this.touchStartX;
      const deltaY = this.touchMoveY - this.touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const duration = Date.now() - this.touchStartTime;

      const thresholdX = typeof this.options.threshold === 'function' ? this.options.threshold('x') : this.options.threshold;
      const thresholdY = typeof this.options.threshold === 'function' ? this.options.threshold('y') : this.options.threshold;

      // Swipes
      if (absDeltaX > thresholdX && absDeltaX > absDeltaY) {
        if (deltaX < 0) {
          this.trigger('swipeleft', event);
        } else {
          this.trigger('swiperight', event);
        }
      } else if (absDeltaY > thresholdY && absDeltaY > absDeltaX) {
        if (deltaY < 0) {
          this.trigger('swipeup', event);
        } else {
          this.trigger('swipedown', event);
        }
      } else if (absDeltaX < this.options.pressThreshold && absDeltaY < this.options.pressThreshold && duration < 300) {
        // Tap / Double Tap
        const now = Date.now();
        if (now - this.lastTapTimestamp < 350) {
          this.trigger('doubletap', event);
          this.lastTapTimestamp = 0;
        } else {
          this.lastTapTimestamp = now;
          this.trigger('tap', event);
        }
      }

      this.trigger('panend', event);
    }

    destroy() {
      this.element.removeEventListener('touchstart', this._onTouchStart);
      this.element.removeEventListener('touchmove', this._onTouchMove);
      this.element.removeEventListener('touchend', this._onTouchEnd);
      this.element.removeEventListener('touchcancel', this._onTouchEnd);
      if (this.options.mouseSupport && this._onMouseDown) {
        this.element.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
      }
      this.handlers = {};
    }
  }

  root.TinyGesture = TinyGesture;
})(typeof window !== 'undefined' ? window : this);
