import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, randi } from './utils';

const SIDES = 6;
const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19]);
const POOL = ['7', '4', '★', 'B', '9', '★', '3', 'A', '8', '2', 'O', '6'];

const RULES = [
  { name: 'prime', test: (l) => PRIMES.has(parseInt(l, 10)) },
  { name: 'even',  test: (l) => !Number.isNaN(parseInt(l, 10)) && parseInt(l, 10) % 2 === 0 },
  { name: 'odd',   test: (l) => !Number.isNaN(parseInt(l, 10)) && parseInt(l, 10) % 2 === 1 },
  { name: 'letter',test: (l) => /[A-Z]/i.test(l) },
  { name: 'symbol',test: (l) => l === '★' },
];

const RULE_EXAMPLE = { prime: '7', even: '4', odd: '9', letter: 'A', symbol: '★' };

function pickRound() {
  const rule = RULES[randi(0, RULES.length - 1)];
  const decoys = POOL.filter((l) => !rule.test(l));
  const labels = Array.from({ length: SIDES }, () => decoys[randi(0, decoys.length - 1)]);
  const correctIdx = randi(0, SIDES - 1);
  labels[correctIdx] = RULE_EXAMPLE[rule.name];
  return { rule, labels, correctIdx };
}

export default function Game04() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    const round = pickRound();
    s.current = { angle: 0, sector: -1, wall: 1, ...round, timer: 3, idx: 0 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.angle += dt * 0.6;
    st.wall -= dt * 0.18;
    st.timer -= dt;
    if (st.wall <= 0.2 || st.timer <= 0) {
      const ok = st.sector === st.correctIdx;
      if (!ok) { setGameOver(true); return; }
      setScore((sc) => sc + 100);
      const round = pickRound();
      Object.assign(st, round, { sector: -1, wall: 1, timer: Math.max(1.2, 3 - st.idx * 0.05), idx: st.idx + 1 });
    }
    const ctx = canvas.getContext('2d');
    const cx = size.w / 2, cy = size.h / 2, R = Math.min(size.w, size.h) * 0.4;
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(st.angle);
    for (let i = 0; i < SIDES; i++) {
      const a0 = (i / SIDES) * Math.PI * 2;
      const a1 = ((i + 1) / SIDES) * Math.PI * 2;
      const r0 = R * st.wall, r1 = R;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
      ctx.lineTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
      ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      ctx.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
      ctx.closePath();
      ctx.fillStyle = i === st.sector ? '#f00' : '#222';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      const mid = (a0 + a1) / 2;
      const lr = (r0 + r1) / 2;
      ctx.save();
      ctx.translate(Math.cos(mid) * lr, Math.sin(mid) * lr);
      ctx.rotate(-st.angle);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.labels[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.rule.name.toUpperCase(), cx, cy - 6);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f80';
    ctx.fillText(`${Math.max(0, st.timer).toFixed(1)}s`, cx, cy + 16);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }, !gameOver && size.w > 0);

  const tap = (dir) => {
    if (!s.current || gameOver) return;
    s.current.sector = ((s.current.sector === -1 ? 0 : s.current.sector) + dir + SIDES) % SIDES;
  };

  return (
    <GameShell gameId="04" title="Hex Taxonomy" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Cycle sectors to the one matching the rule" controls={
      <div className="touch-controls">
        <button type="button" className="touch-btn" onClick={() => tap(-1)}>↺</button>
        <button type="button" className="touch-btn" onClick={() => tap(1)}>↻</button>
      </div>
    }>
      <canvas ref={canvasRef} className="game-canvas" onClick={(e) => {
        const cx = size.w / 2;
        tap(e.clientX < cx ? -1 : 1);
      }} />
    </GameShell>
  );
}
