import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp } from './utils';

const CELL = 8;

export default function Game18() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    const cols = Math.floor(size.w / CELL);
    const rows = Math.floor(size.h / CELL);
    const danger = new Uint8Array(cols * rows);
    for (let i = 0; i < danger.length; i++) if (Math.random() < 0.02) danger[i] = 1;
    s.current = { cols, rows, danger, safe: null, safeLife: 0, px: cols >> 1, py: rows >> 1, tick: 0, moveCd: 0 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.tick += dt;
    if (st.tick > 0.4) {
      st.tick = 0;
      for (let i = 0; i < st.danger.length; i++) if (st.danger[i] && Math.random() < 0.08) {
        const x = i % st.cols, y = (i / st.cols) | 0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < st.cols && ny < st.rows) st.danger[ny * st.cols + nx] = 1;
        });
      }
    }
    st.moveCd -= dt;
    if (st.moveCd <= 0) {
      let moved = false;
      if (keyDown(keys, 'w', 'arrowup')) { st.py--; moved = true; }
      else if (keyDown(keys, 's', 'arrowdown')) { st.py++; moved = true; }
      else if (keyDown(keys, 'a', 'arrowleft')) { st.px--; moved = true; }
      else if (keyDown(keys, 'd', 'arrowright')) { st.px++; moved = true; }
      if (moved) st.moveCd = 0.12;
    }
    st.px = clamp(st.px, 0, st.cols - 1);
    st.py = clamp(st.py, 0, st.rows - 1);
    const idx = st.py * st.cols + st.px;
    if (st.danger[idx] && st.safe !== idx) setGameOver(true);
    if (st.safe) {
      st.safeLife -= dt;
      if (st.safeLife <= 0) st.safe = null;
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    for (let y = 0; y < st.rows; y++) {
      for (let x = 0; x < st.cols; x++) {
        const i = y * st.cols + x;
        if (st.safe === i) ctx.fillStyle = '#0f0';
        else if (st.danger[i]) ctx.fillStyle = '#400';
        else ctx.fillStyle = '#111';
        ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(st.px * CELL, st.py * CELL, CELL, CELL);
  }, !gameOver && size.w > 0);

  const markSafe = () => {
    const st = s.current;
    if (!st) return;
    st.safe = st.py * st.cols + st.px;
    st.safeLife = 3;
    setScore((sc) => sc + 10);
  };

  return (
    <GameShell gameId="18" title="The Last Safe Pixel" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="WASD move · Tap MARK for one safe pixel">
      <canvas ref={canvasRef} className="game-canvas" />
      <button type="button" className="game-btn" style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 8 }} onClick={markSafe}>MARK</button>
    </GameShell>
  );
}
