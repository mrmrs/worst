import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp, rand } from './utils';

export default function Game12() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [debt, setDebt] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { px: size.w / 2, py: size.h / 2, pixels: [], zones: [{ x: size.w * 0.8, y: size.h * 0.8, r: 40 }] };
    setDebt(0);
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    const spd = 120 * (1 + debt / 200);
    if (keyDown(keys, 'w', 'arrowup')) st.py -= spd * dt;
    if (keyDown(keys, 's', 'arrowdown')) st.py += spd * dt;
    if (keyDown(keys, 'a', 'arrowleft')) st.px -= spd * dt;
    if (keyDown(keys, 'd', 'arrowright')) st.px += spd * dt;
    st.px = clamp(st.px, 10, size.w - 10);
    st.py = clamp(st.py, 10, size.h - 10);
    if (Math.random() < dt * 2) st.pixels.push({ x: rand(20, size.w - 20), y: rand(20, size.h - 60), v: rand(5, 20) });
    st.pixels.forEach((p) => {
      if (Math.hypot(p.x - st.px, p.y - st.py) < 14) {
        setDebt((d) => d + p.v);
        setScore((sc) => sc + p.v);
        p.collected = true;
      }
    });
    st.pixels = st.pixels.filter((p) => !p.collected);
    st.zones.forEach((z) => {
      if (Math.hypot(z.x - st.px, z.y - st.py) < z.r) setDebt((d) => Math.max(0, d - 40 * dt));
    });
    if (debt > 100) {
      if (Math.random() < dt * debt / 100) setGameOver(true);
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    st.pixels.forEach((p) => { ctx.fillStyle = '#ff0'; ctx.fillRect(p.x, p.y, 6, 6); });
    st.zones.forEach((z) => { ctx.strokeStyle = '#0f0'; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.px, st.py, 8 + debt / 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f80';
    ctx.fillRect(8, size.h - 20, (debt / 100) * (size.w - 16), 8);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="12" title="Pixel Debt" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="WASD collect · Green zone repays · Debt punishes">
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
