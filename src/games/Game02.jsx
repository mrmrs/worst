import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { isPureRed, setupCtx, rand, clamp } from './utils';

export default function Game02() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [phase, setPhase] = useState('dodge');
  const [guess, setGuess] = useState('');
  const [target, setTarget] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    const w = Math.floor(size.w);
    const h = Math.floor(size.h);
    const data = new Uint8ClampedArray(w * h * 4);
    let reds = 0;
    for (let i = 0; i < w * h; i++) {
      const r = rand(0, 255) | 0;
      const g = rand(0, 255) | 0;
      const b = rand(0, 255) | 0;
      if (Math.random() < 0.008 && isPureRed(r, g, b)) reds++;
      else if (Math.random() < 0.02) {
        data[i * 4] = 255; data[i * 4 + 1] = rand(20, 80) | 0; data[i * 4 + 2] = rand(20, 80) | 0;
      } else {
        data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b;
      }
      data[i * 4 + 3] = 255;
    }
    reds = 0;
    for (let i = 0; i < w * h; i++) {
      if (isPureRed(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])) reds++;
      else if (Math.random() < 0.006) {
        data[i * 4] = 255; data[i * 4 + 1] = 0; data[i * 4 + 2] = 0;
        reds++;
      }
    }
    s.current = {
      w, h, data, reds, px: size.w / 2, py: size.h * 0.7, t: 8,
      obstacles: Array.from({ length: 6 }, () => ({ x: rand(20, size.w - 20), y: -20, vx: rand(-40, 40), vy: rand(60, 120), r: rand(12, 24) })),
      scroll: 0,
    };
    setTarget(reds);
    setPhase('dodge');
    setGameOver(false);
    setScore(0);
    setGuess('');
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver || phase !== 'dodge') return;
    st.t -= dt;
    st.scroll += dt * 20;
    st.px = clamp(st.px + (st.touchX || 0) * 200 * dt, 16, size.w - 16);
    let hit = false;
    st.obstacles.forEach((o) => {
      o.y += o.vy * dt;
      o.x += o.vx * dt;
      if (o.y > size.h + 30) { o.y = -30; o.x = rand(20, size.w - 20); }
      if (Math.hypot(o.x - st.px, o.y - st.py) < o.r + 8) hit = true;
    });
    if (hit) { setGameOver(true); return; }
    if (st.t <= 0) setPhase('guess');
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    const img = new ImageData(st.data, st.w, st.h);
    ctx.putImageData(img, 0, Math.sin(st.scroll) * 4);
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.arc(st.px, st.py, 8, 0, Math.PI * 2);
    ctx.fill();
    st.obstacles.forEach((o) => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`${Math.ceil(st.t)}s — count #ff0000 only`, 12, 24);
  }, phase === 'dodge' && !gameOver && size.w > 0);

  const submitGuess = () => {
    const n = parseInt(guess, 10);
    const diff = Math.abs((Number.isNaN(n) ? 0 : n) - target);
    const pts = Math.max(0, 500 - diff * 10);
    setScore((sc) => sc + pts);
    if (diff > 50) setGameOver(true);
    else setSeed((x) => x + 1);
  };

  return (
    <GameShell gameId="02" title="Red Pixel Census" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint={phase === 'dodge' ? 'Drag bottom · Dodge white · Count pure red' : 'Enter your count'}>
      <canvas ref={canvasRef} className="game-canvas" onPointerMove={(e) => { if (s.current) s.current.touchX = ((e.nativeEvent.offsetX / size.w) - 0.5) * 2; }} onPointerDown={(e) => { if (s.current) s.current.touchX = ((e.nativeEvent.offsetX / size.w) - 0.5) * 2; }} />
      {phase === 'guess' && !gameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}>
          <p style={{ fontSize: 12, marginBottom: 16 }}>How many #ff0000 pixels?</p>
          <input type="number" value={guess} onChange={(e) => setGuess(e.target.value)} style={{ fontSize: 32, width: 120, textAlign: 'center', background: '#111', color: '#fff', border: '1px solid #fff', fontFamily: 'inherit' }} />
          <button type="button" className="game-btn" style={{ marginTop: 16 }} onClick={submitGuess}>Submit</button>
        </div>
      )}
    </GameShell>
  );
}
