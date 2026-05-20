import { useRef, useState, useCallback, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp } from './utils';
import { TouchControls } from './utils';

const CELL = 4;

export default function Game01() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const touch = useRef({ left: false, right: false, thrust: false });
  const state = useRef(null);

  const init = useCallback(() => {
    if (!size.w) return;
    const cols = Math.floor(size.w / CELL);
    const rows = Math.floor(size.h / CELL);
    const grid = new Uint8Array(cols * rows);
    state.current = {
      cols,
      rows,
      grid,
      fade: new Float32Array(cols * rows),
      x: size.w / 2,
      y: size.h / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      nearMiss: 0,
      streak: 0,
      level: 1,
      lastIdx: -1,
      t0: performance.now(),
    };
    setScore(0);
    setGameOver(false);
  }, [size.w, size.h]);

  useEffect(() => { init(); }, [init, seed]);

  useGameLoop((dt) => {
    const s = state.current;
    const canvas = canvasRef.current;
    if (!s || !canvas || gameOver || !size.w) return;
    const ctx = canvas.getContext('2d');
    const turn = (touch.current.left || keyDown(keys, 'a', 'arrowleft') ? -1 : 0) + (touch.current.right || keyDown(keys, 'd', 'arrowright') ? 1 : 0);
    const thrust = touch.current.thrust || keyDown(keys, 'w', 'arrowup', ' ');
    s.angle += turn * 3.5 * dt;
    if (thrust) {
      s.vx += Math.cos(s.angle) * 120 * dt;
      s.vy += Math.sin(s.angle) * 120 * dt;
      s.streak += dt;
    } else s.streak = 0;
    s.vx *= 0.98;
    s.vy *= 0.98;
    const sp = Math.hypot(s.vx, s.vy);
    if (sp < 28) {
      s.vx += Math.cos(s.angle) * 28 * dt;
      s.vy += Math.sin(s.angle) * 28 * dt;
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.x = clamp(s.x, CELL, size.w - CELL);
    s.y = clamp(s.y, CELL, size.h - CELL);
    const gx = Math.floor(s.x / CELL);
    const gy = Math.floor(s.y / CELL);
    const idx = gy * s.cols + gx;
    if (idx !== s.lastIdx) {
      if (s.grid[idx] === 1) {
        setGameOver(true);
        return;
      }
      s.grid[idx] = 1;
      s.lastIdx = idx;
      setScore((sc) => sc + 1 + Math.floor(s.streak * 2));
    }
    let near = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= s.cols || ny >= s.rows) continue;
        const ni = ny * s.cols + nx;
        if (s.grid[ni] === 1 && (dx || dy)) near = true;
        if (s.level > 2 && s.grid[ni] === 1) s.fade[ni] = Math.max(s.fade[ni], 0.15);
      }
    }
    if (near) setScore((sc) => sc + 1);
    s.level = 1 + Math.floor((performance.now() - s.t0) / 1000 / 30);
    for (let i = 0; i < s.fade.length; i++) if (s.fade[i] > 0) s.fade[i] = Math.max(0, s.fade[i] - dt * 0.05);

    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    for (let y = 0; y < s.rows; y++) {
      for (let x = 0; x < s.cols; x++) {
        const i = y * s.cols + x;
        if (s.grid[i]) {
          const alpha = s.level > 2 && s.fade[i] < 0.5 ? s.fade[i] * 2 : 1;
          ctx.fillStyle = alpha < 0.3 ? `rgba(255,0,0,${alpha})` : '#f00';
          if (alpha < 0.3 && s.grid[i]) { /* still deadly */ }
          ctx.globalAlpha = Math.max(0.15, alpha);
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          ctx.globalAlpha = 1;
        }
      }
    }
    if (near) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f00';
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    ctx.shadowBlur = 0;
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="01" title="Disturbance Field" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((s) => s + 1)} hint="Turn ◀▶ · Thrust ● · Never touch red" controls={<TouchControls left={(v) => { touch.current.left = v; }} right={(v) => { touch.current.right = v; }} action={() => { touch.current.thrust = true; setTimeout(() => { touch.current.thrust = false; }, 100); }} />}>
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
