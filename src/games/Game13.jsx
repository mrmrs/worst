import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx } from './utils';

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

const RULES = ['any', 'odd', 'prime', 'silent'];
const RADIUS = 100;

export default function Game13() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [rule, setRule] = useState('any');
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { angle: 0, moved: false, bpm: 100, t: 0, beat: 0, obstacles: [], misses: 3 };
    setGameOver(false);
    setScore(0);
    setRule('any');
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.t += dt;
    const interval = 60 / st.bpm;
    if (st.t >= interval) {
      st.t -= interval;
      st.beat++;
      const ruleNow = st.rule || rule;
      if (st.moved) {
        let ok = true;
        if (ruleNow === 'odd') ok = st.beat % 2 === 1;
        if (ruleNow === 'prime') ok = isPrime(st.beat);
        if (ruleNow === 'silent') ok = false;
        if (ok) setScore((sc) => sc + 25);
        else {
          st.misses--;
          if (st.misses <= 0) { setGameOver(true); return; }
        }
      }
      st.moved = false;
      if (st.beat > 0 && st.beat % 8 === 0) {
        const nr = RULES[Math.floor(st.beat / 8) % RULES.length];
        st.rule = nr;
        setRule(nr);
      } else if (!st.rule) {
        st.rule = ruleNow;
      }
      const a = Math.random() * Math.PI * 2;
      st.obstacles.push({ a, life: 2.5 });
      if (st.obstacles.length > 16) st.obstacles.splice(0, st.obstacles.length - 16);
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    const cx = size.w / 2, cy = size.h / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.strokeStyle = st.t < 0.08 ? '#fff' : '#333';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`beat ${st.beat} · rule: ${st.rule || rule} · ♥${st.misses}`, 12, 24);
    const px = cx + Math.cos(st.angle) * RADIUS;
    const py = cy + Math.sin(st.angle) * RADIUS;
    st.obstacles = st.obstacles.filter((o) => {
      o.life -= dt;
      if (o.life <= 0) return false;
      const x = cx + Math.cos(o.a) * RADIUS;
      const y = cy + Math.sin(o.a) * RADIUS;
      const alpha = Math.min(1, o.life / 2.5);
      ctx.fillStyle = `rgba(255,0,0,${alpha})`;
      ctx.fillRect(x - 6, y - 6, 12, 12);
      if (Math.hypot(x - px, y - py) < 14) setGameOver(true);
      return true;
    });
    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
  }, !gameOver && size.w > 0);

  const move = (da) => {
    if (!s.current || gameOver) return;
    s.current.angle += da;
    s.current.moved = true;
  };

  return (
    <GameShell gameId="13" title="Unfair Metronome" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Move only on valid beats · 3 mistakes max">
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="touch-controls">
        <button type="button" className="touch-btn" onClick={() => move(-0.4)}>↺</button>
        <button type="button" className="touch-btn" onClick={() => move(0.4)}>↻</button>
      </div>
    </GameShell>
  );
}
