import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, clamp, rand } from './utils';

export default function Game19() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = {
      paddle: size.h - 40,
      balls: [{ x: size.w / 2, y: size.h / 2, vx: 120, vy: -120, real: true }],
    };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.paddleX = clamp((st.paddleX ?? size.w / 2) + (st.dx || 0) * 300 * dt, 40, size.w - 40);
    let realLost = false;
    st.balls.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < 8 || b.x > size.w - 8) b.vx *= -1;
      if (b.y < 8) b.vy *= -1;
      if (b.y > size.h - 32 && b.vy > 0 && Math.abs(b.x - st.paddleX) < 44) b.vy = -Math.abs(b.vy);
      if (b.y > size.h) {
        if (b.real) realLost = true;
        b.dead = true;
      }
      if (b.y < 8 && Math.random() < 0.02) {
        st.balls.push({ x: b.x, y: b.y, vx: rand(-150, 150), vy: rand(80, 150), real: false });
        if (b.real) st.balls.push({ x: b.x, y: b.y, vx: -b.vx, vy: b.vy, real: true });
      }
    });
    st.balls = st.balls.filter((b) => !b.dead);
    if (realLost || st.balls.filter((b) => b.real).length === 0) setGameOver(true);
    setScore((sc) => sc + dt * 10);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(st.paddleX - 40, size.h - 24, 80, 8);
    st.balls.forEach((b) => {
      ctx.fillStyle = b.real ? '#fff' : '#666';
      ctx.shadowBlur = b.real ? 8 : 0;
      ctx.shadowColor = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="19" title="Mitosis Pong" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint="Drag paddle · Save the glowing real ball">
      <canvas ref={canvasRef} className="game-canvas"
        onPointerMove={(e) => { if (s.current) s.current.paddleX = e.nativeEvent.offsetX; }}
        onTouchMove={(e) => { if (s.current && e.touches[0]) { const r = e.target.getBoundingClientRect(); s.current.paddleX = e.touches[0].clientX - r.left; } }}
      />
    </GameShell>
  );
}
