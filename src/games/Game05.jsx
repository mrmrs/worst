import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, rand, randi } from './utils';

export default function Game05() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [infection, setInfection] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);
  const cutting = useRef(false);

  useEffect(() => {
    if (!size.w) return;
    const cells = [];
    const gw = 24, gh = Math.floor((size.h / size.w) * 24);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const t = randi(0, 3);
        cells.push({ x, y, type: t, alive: true });
      }
    }
    const target = { x: randi(4, gw - 5), y: randi(4, gh - 5), w: 6, h: 4 };
    s.current = { cells, gw, gh, target, cuts: 0, revealed: 0, targetClaimed: false };
    setInfection(0);
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  const cutAt = (px, py) => {
    const st = s.current;
    if (!st) return;
    const cw = size.w / st.gw, ch = size.h / st.gh;
    const gx = Math.floor(px / cw), gy = Math.floor(py / ch);
    st.cells.forEach((c) => {
      if (!c.alive || Math.abs(c.x - gx) > 1 || Math.abs(c.y - gy) > 1) return;
      if (c.type === 2) { setInfection((i) => Math.min(100, i + 8)); setGameOver(true); }
      else if (c.type === 1) { setInfection((i) => Math.min(100, i + 3)); c.type = 3; }
      else { c.alive = false; st.cuts++; st.revealed++; setScore((sc) => sc + 5); }
    });
    const inTarget = gx >= st.target.x && gx < st.target.x + st.target.w && gy >= st.target.y && gy < st.target.y + st.target.h;
    if (inTarget && st.revealed > 30 && !st.targetClaimed) {
      st.targetClaimed = true;
      setScore((sc) => sc + 200);
    }
  };

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    if (infection >= 100) setGameOver(true);
    const ctx = canvas.getContext('2d');
    const cw = size.w / st.gw, ch = size.h / st.gh;
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size.w, size.h);
    st.cells.forEach((c) => {
      if (!c.alive) return;
      const colors = ['#444', '#2a4', '#f00', '#633'];
      ctx.fillStyle = colors[c.type];
      ctx.fillRect(c.x * cw + 1, c.y * ch + 1, cw - 2, ch - 2);
    });
    ctx.strokeStyle = '#0f0';
    ctx.strokeRect(st.target.x * cw, st.target.y * ch, st.target.w * cw, st.target.h * ch);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(`infection ${infection}%`, 8, 20);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="05" title="Negative Space Surgeon" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Drag to cut · Green=safe · Red=forbidden · Reveal green outline">
      <canvas ref={canvasRef} className="game-canvas"
        onPointerDown={(e) => { cutting.current = true; cutAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY); }}
        onPointerMove={(e) => { if (cutting.current) cutAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY); }}
        onPointerUp={() => { cutting.current = false; }}
      />
    </GameShell>
  );
}
