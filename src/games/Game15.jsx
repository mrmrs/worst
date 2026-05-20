import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, randi } from './utils';

const ZONES = [
  { color: '#f00', label: 'RED' },
  { color: '#0f0', label: 'GREEN' },
  { color: '#00f', label: 'BLUE' },
  { color: '#ff0', label: 'YELLOW' },
];

const COLOR_INK = ['#f00', '#0f0', '#00f', '#ff0'];

function makeCmd() {
  const rule = Math.random() < 0.5 ? 'ink' : 'meaning';
  const meaningIdx = randi(0, 3);
  let inkIdx;
  do { inkIdx = randi(0, 3); } while (inkIdx === meaningIdx);
  return {
    text: ZONES[meaningIdx].label,
    ink: COLOR_INK[inkIdx],
    rule,
    ans: rule === 'ink' ? inkIdx : meaningIdx,
  };
}

export default function Game15() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { sector: -1, cmd: makeCmd(), timer: 2.5, idx: 0 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.timer -= dt;
    if (st.timer <= 0) {
      if (st.sector !== st.cmd.ans) { setGameOver(true); return; }
      setScore((sc) => sc + 100);
      st.idx++;
      st.cmd = makeCmd();
      st.sector = -1;
      st.timer = Math.max(1, 2.5 - st.idx * 0.05);
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    const cx = size.w / 2, cy = size.h / 2, R = Math.min(size.w, size.h) * 0.4;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    ZONES.forEach((z, i) => {
      const a0 = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = z.color;
      ctx.globalAlpha = st.sector === i ? 1 : 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
      const ma = (a0 + a1) / 2;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.label, cx + Math.cos(ma) * R * 0.75, cy + Math.sin(ma) * R * 0.75);
    });
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = st.cmd.ink;
    ctx.font = 'bold 32px monospace';
    ctx.fillText(st.cmd.text, cx, cy - 6);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(`obey ${st.cmd.rule}`, cx, cy + 14);
    ctx.fillStyle = '#f80';
    ctx.fillText(st.timer.toFixed(1), cx, cy + 30);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="15" title="Color Command Contradiction" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Tap the zone matching ink-or-meaning per rule">
      <canvas ref={canvasRef} className="game-canvas" onClick={(e) => {
        const st = s.current;
        if (!st) return;
        const cx = size.w / 2, cy = size.h / 2;
        let a = Math.atan2(e.nativeEvent.offsetY - cy, e.nativeEvent.offsetX - cx) + Math.PI / 2;
        if (a < 0) a += Math.PI * 2;
        st.sector = Math.floor(a / (Math.PI / 2)) % 4;
      }} />
    </GameShell>
  );
}
