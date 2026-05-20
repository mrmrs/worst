import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, clamp } from './utils';

const LEVELS = [
  { start: { x: 0.1, y: 0.5 }, exit: { x: 0.9, y: 0.5 }, walls: [] },
  { start: { x: 0.1, y: 0.1 }, exit: { x: 0.9, y: 0.9 }, walls: [{ x: 0.45, y: 0, w: 0.1, h: 0.7 }] },
  { start: { x: 0.5, y: 0.1 }, exit: { x: 0.5, y: 0.9 }, walls: [{ x: 0, y: 0.45, w: 0.7, h: 0.1 }, { x: 0.75, y: 0.45, w: 0.25, h: 0.1 }] },
];

const ZONES = [
  { x: 0, y: 0, w: 0.5, h: 0.5, mode: 'invert', label: '???' },
  { x: 0.5, y: 0, w: 0.5, h: 0.5, mode: 'delay', label: 'LAG' },
  { x: 0, y: 0.5, w: 0.5, h: 0.5, mode: 'snap', label: 'GRID' },
  { x: 0.5, y: 0.5, w: 0.5, h: 0.5, mode: 'swap', label: 'XY↔' },
];

export default function Game06() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    const lv = LEVELS[level % LEVELS.length];
    s.current = { px: lv.start.x * size.w, py: lv.start.y * size.h, target: lv.exit, walls: lv.walls, touches: 0, t0: Date.now(), delayed: { x: 0, y: 0 } };
    setGameOver(false);
  }, [size.w, size.h, level, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    const mx = st.mx ?? st.px, my = st.my ?? st.py;
    let dx = mx - st.px, dy = my - st.py;
    const zone = ZONES.find((z) => mx / size.w >= z.x && mx / size.w < z.x + z.w && my / size.h >= z.y && my / size.h < z.y + z.h);
    if (zone?.mode === 'invert') { dx = -dx; dy = -dy; }
    if (zone?.mode === 'swap') { const t = dx; dx = dy; dy = t; }
    if (zone?.mode === 'snap') { dx = Math.sign(dx) * Math.min(Math.abs(dx), 8); dy = Math.sign(dy) * Math.min(Math.abs(dy), 8); }
    if (zone?.mode === 'delay') {
      st.delayed.x += (dx - st.delayed.x) * 0.08;
      st.delayed.y += (dy - st.delayed.y) * 0.08;
      dx = st.delayed.x; dy = st.delayed.y;
    }
    st.px = clamp(st.px + dx * 0.5, 8, size.w - 8);
    st.py = clamp(st.py + dy * 0.5, 8, size.h - 8);
    st.walls.forEach((w) => {
      const wx = w.x * size.w, wy = w.y * size.h, ww = w.w * size.w, wh = w.h * size.h;
      if (st.px > wx && st.px < wx + ww && st.py > wy && st.py < wy + wh) { st.touches++; setGameOver(true); }
    });
    const ex = st.target.x * size.w, ey = st.target.y * size.h;
    if (Math.hypot(st.px - ex, st.py - ey) < 20) {
      setScore((sc) => sc + Math.max(100, 1000 - (Date.now() - st.t0) - st.touches * 100));
      setLevel((l) => l + 1);
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, size.w, size.h);
    ZONES.forEach((z) => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(z.x * size.w, z.y * size.h, z.w * size.w, z.h * size.h);
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText(z.label, z.x * size.w + 8, z.y * size.h + 16);
    });
    st.walls.forEach((w) => { ctx.fillStyle = '#f00'; ctx.fillRect(w.x * size.w, w.y * size.h, w.w * size.w, w.h * size.h); });
    ctx.fillStyle = '#0f0';
    ctx.fillRect(ex - 10, ey - 10, 20, 20);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.px, st.py, 6, 0, Math.PI * 2); ctx.fill();
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="06" title="Cursor Must Not Understand" score={score} gameOver={gameOver} finalScore={score} onRestart={() => { setLevel(0); setSeed((x) => x + 1); }} hint="Reach green · Zones lie about controls">
      <canvas ref={canvasRef} className="game-canvas" onPointerMove={(e) => { if (s.current) { s.current.mx = e.nativeEvent.offsetX; s.current.my = e.nativeEvent.offsetY; } }} />
    </GameShell>
  );
}
