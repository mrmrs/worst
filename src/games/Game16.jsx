import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp } from './utils';

export default function Game16() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const breathing = useRef(false);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { px: size.w / 2, py: size.h / 2, phase: 0, bullets: [], stress: 0 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.phase += dt * 0.5;
    const inhale = Math.sin(st.phase) > 0;
    const shouldBreathe = breathing.current || keyDown(keys, ' ');
    if (shouldBreathe !== inhale) st.stress = (st.stress || 0) + dt * 30;
    else st.stress = Math.max(0, (st.stress || 0) - dt * 10);
    if (st.stress > 100) setGameOver(true);
    const safe = inhale === shouldBreathe;
    if (keyDown(keys, 'a', 'arrowleft')) st.px -= 150 * dt;
    if (keyDown(keys, 'd', 'arrowright')) st.px += 150 * dt;
    if (keyDown(keys, 'w', 'arrowup')) st.py -= 130 * dt;
    if (keyDown(keys, 's', 'arrowdown')) st.py += 130 * dt;
    st.px = clamp(st.px, 20, size.w - 20);
    st.py = clamp(st.py, 20, size.h - 20);
    if (!safe && Math.random() < dt) st.bullets.push({ x: Math.random() * size.w, y: 0, vy: 200 });
    st.bullets = st.bullets.filter((b) => {
      b.y += b.vy * dt;
      if (Math.hypot(b.x - st.px, b.y - st.py) < 14) setGameOver(true);
      return b.y < size.h;
    });
    if (safe) setScore((sc) => sc + dt * 10);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    const br = 60 + Math.sin(st.phase) * 40;
    ctx.strokeStyle = inhale ? '#8cf' : '#f88';
    ctx.beginPath(); ctx.arc(size.w / 2, size.h / 2, br, 0, Math.PI * 2); ctx.stroke();
    st.bullets.forEach((b) => { ctx.fillStyle = '#f00'; ctx.fillRect(b.x, b.y, 6, 6); });
    ctx.fillStyle = '#fff';
    ctx.fillRect(st.px - 6, st.py - 6, 12, 12);
    ctx.fillStyle = `rgba(255,0,0,${st.stress / 100})`;
    ctx.fillRect(0, 0, size.w, size.h);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="16" title="Breathe or Die" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint="Hold breath in sync with circle · A/D move">
      <canvas ref={canvasRef} className="game-canvas" />
      <button type="button" className="touch-btn" style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 8 }}
        onTouchStart={() => { breathing.current = true; }} onTouchEnd={() => { breathing.current = false; }}
        onMouseDown={() => { breathing.current = true; }} onMouseUp={() => { breathing.current = false; }}>BREATHE</button>
    </GameShell>
  );
}
