import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx } from './utils';

const N = 24;
const CELL = 14;

export default function Game23() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    s.current = {
      grid: new Uint8Array(N * N),
      px: 1, py: 1,
      exit: { x: N - 2, y: N - 2 },
      tick: 0,
      moveCd: 0,
    };
    setGameOver(false);
    setScore(0);
  }, [seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.tick += dt;
    if (st.tick > 0.5) {
      st.tick = 0;
      const spread = new Uint8Array(st.grid);
      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          if (st.grid[y * N + x] === 1) {
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dx, dy] of dirs) {
              if (Math.random() < 0.15) spread[(y + dy) * N + (x + dx)] = 1;
            }
          }
        }
      }
      st.grid = spread;
    }
    st.moveCd -= dt;
    if (st.moveCd <= 0) {
      let nx = st.px, ny = st.py;
      if (keyDown(keys, 'w', 'arrowup')) ny--;
      else if (keyDown(keys, 's', 'arrowdown')) ny++;
      else if (keyDown(keys, 'a', 'arrowleft')) nx--;
      else if (keyDown(keys, 'd', 'arrowright')) nx++;
      if (nx !== st.px || ny !== st.py) {
        st.px = Math.max(1, Math.min(N - 2, nx));
        st.py = Math.max(1, Math.min(N - 2, ny));
        const idx = st.py * N + st.px;
        if (st.grid[idx] === 1) { setGameOver(true); return; }
        st.grid[idx] = 1;
        st.moveCd = 0.12;
        setScore((sc) => sc + 2);
      }
    }
    if (st.px === st.exit.x && st.py === st.exit.y) { setScore((sc) => sc + 500); setGameOver(true); return; }
    let corrupt = 0;
    for (let i = 0; i < st.grid.length; i++) if (st.grid[i]) corrupt++;
    if (corrupt / (N * N) > 0.7) setGameOver(true);
    const ctx = canvas.getContext('2d');
    const ox = (size.w - N * CELL) / 2, oy = (size.h - N * CELL) / 2;
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const v = st.grid[y * N + x];
        ctx.fillStyle = v ? '#f00' : '#1a1a1a';
        if (x === st.exit.x && y === st.exit.y) ctx.fillStyle = '#0f0';
        ctx.fillRect(ox + x * CELL, oy + y * CELL, CELL - 1, CELL - 1);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(ox + st.px * CELL, oy + st.py * CELL, CELL, CELL);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="23" title="Minimum Viable Apocalypse" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="WASD on grid · Reach green · Each step corrupts">
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
