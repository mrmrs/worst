import React from 'react';

export const rand = (a, b) => a + Math.random() * (b - a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function isPureRed(r, g, b) {
  return r === 255 && g === 0 && b === 0;
}

export function setupCtx(ctx, dpr) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function TouchControls({ left, right, action }) {
  return (
    <div className="touch-controls">
      {left && (
        <button type="button" className="touch-btn" onTouchStart={(e) => { e.preventDefault(); left(true); }} onTouchEnd={() => left(false)} onMouseDown={() => left(true)} onMouseUp={() => left(false)} onMouseLeave={() => left(false)}>
          ◀
        </button>
      )}
      {action && (
        <button type="button" className="touch-btn" style={{ margin: '0 auto' }} onTouchStart={(e) => { e.preventDefault(); action(); }} onClick={action}>
          ●
        </button>
      )}
      {right && (
        <button type="button" className="touch-btn" onTouchStart={(e) => { e.preventDefault(); right(true); }} onTouchEnd={() => right(false)} onMouseDown={() => right(true)} onMouseUp={() => right(false)} onMouseLeave={() => right(false)}>
          ▶
        </button>
      )}
    </div>
  );
}
