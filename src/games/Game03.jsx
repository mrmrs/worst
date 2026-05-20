import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp, rand } from './utils';

export default function Game03() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = {
      tx: size.w / 2, ty: size.h / 2,
      trail: [],
      lag: 0.18,
      gates: [],
      t: 0,
      delay: 0.15,
    };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.t += dt;
    st.delay = 0.12 + Math.sin(st.t * 0.1) * 0.08;
    const spd = 180;
    if (keyDown(keys, 'a', 'arrowleft')) st.tx -= spd * dt;
    if (keyDown(keys, 'd', 'arrowright')) st.tx += spd * dt;
    if (keyDown(keys, 'w', 'arrowup')) st.ty -= spd * dt;
    if (keyDown(keys, 's', 'arrowdown')) st.ty += spd * dt;
    st.tx = clamp(st.tx, 12, size.w - 12);
    st.ty = clamp(st.ty, 12, size.h - 12);
    st.trail.push({ x: st.tx, y: st.ty, t: st.t });
    const lagT = st.t - st.delay;
    let vx = st.tx, vy = st.ty;
    for (let i = st.trail.length - 1; i >= 0; i--) {
      if (st.trail[i].t <= lagT) { vx = st.trail[i].x; vy = st.trail[i].y; break; }
    }
    if (st.trail.length > 200) st.trail.shift();
    if (Math.random() < dt * 0.8) {
      const vert = Math.random() > 0.5;
      st.gates.push(vert
        ? { x: rand(size.w * 0.2, size.w * 0.8), y: -20, w: 8, h: size.h * 0.35, vx: 0, vy: 100, gap: size.h * 0.4 }
        : { x: -20, y: rand(size.h * 0.2, size.h * 0.8), w: size.w * 0.35, h: 8, vx: 100, vy: 0, gap: size.w * 0.4 });
    }
    st.gates = st.gates.filter((g) => {
      g.x += g.vx * dt; g.y += g.vy * dt;
      const inWall = g.w < 20
        ? (vx > g.x && vx < g.x + g.w && (vy < g.y || vy > g.y + g.h + g.gap))
        : (vy > g.y && vy < g.y + g.h && (vx < g.x || vx > g.x + g.w + g.gap));
      if (inWall) setGameOver(true);
      if (!g.scored && !inWall && ((g.vy && g.y > size.h) || (g.vx && g.x > size.w))) {
        g.scored = true;
        setScore((sc) => sc + 50);
      }
      return g.y < size.h + 50 && g.x < size.w + 50;
    });
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    st.gates.forEach((g) => {
      ctx.fillStyle = '#333';
      if (g.w < 20) {
        ctx.fillRect(g.x, 0, g.w, g.y);
        ctx.fillRect(g.x, g.y + g.h + g.gap, g.w, size.h);
      } else {
        ctx.fillRect(0, g.y, g.x, g.h);
        ctx.fillRect(g.x + g.w + g.gap, g.y, size.w, g.h);
      }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(vx, vy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.tx, st.ty, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`lag ${(st.delay * 1000).toFixed(0)}ms`, 8, size.h - 12);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="03" title="One Frame Too Late" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="WASD — trust the faint ghost, not the white dot">
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
