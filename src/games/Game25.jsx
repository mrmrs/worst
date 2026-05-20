import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx } from './utils';

export default function Game25() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const [flashesLeft, setFlashesLeft] = useState(3);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    const cols = 20, rows = 28;
    const walls = new Set();
    for (let i = 0; i < cols * rows; i++) {
      const x = i % cols, y = (i / cols) | 0;
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || Math.random() < 0.12) walls.add(i);
    }
    walls.delete(1 * cols + 1);
    walls.delete((rows - 2) * cols + (cols - 2));
    s.current = {
      cols, rows, walls, seen: new Set(),
      px: 1, py: 1,
      exit: { x: cols - 2, y: rows - 2 },
      enemy: { x: cols - 2, y: 2 },
      flashes: 3,
      reveal: [],
      moveCd: 0,
      enemyCd: 0,
    };
    setGameOver(false);
    setScore(0);
    setFlashesLeft(3);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    const CELL = Math.min(size.w / st.cols, size.h / st.rows);
    st.moveCd -= dt;
    if (st.moveCd <= 0) {
      let nx = st.px, ny = st.py;
      if (keyDown(keys, 'w', 'arrowup')) ny--;
      else if (keyDown(keys, 's', 'arrowdown')) ny++;
      else if (keyDown(keys, 'a', 'arrowleft')) nx--;
      else if (keyDown(keys, 'd', 'arrowright')) nx++;
      if ((nx !== st.px || ny !== st.py) && nx >= 0 && ny >= 0 && nx < st.cols && ny < st.rows) {
        const ni = ny * st.cols + nx;
        if (!st.walls.has(ni)) {
          st.px = nx; st.py = ny;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const sx = nx + dx, sy = ny + dy;
              if (sx >= 0 && sy >= 0 && sx < st.cols && sy < st.rows) st.seen.add(sy * st.cols + sx);
            }
          }
          st.moveCd = 0.14;
          setScore((sc) => sc + 1);
        }
      }
    }
    st.enemyCd -= dt;
    if (st.enemyCd <= 0) {
      st.enemyCd = 0.6;
      const dx = Math.sign(st.px - st.enemy.x);
      const dy = Math.sign(st.py - st.enemy.y);
      const tryMoves = Math.abs(st.px - st.enemy.x) > Math.abs(st.py - st.enemy.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
      for (const [mx, my] of tryMoves) {
        const ex = st.enemy.x + mx, ey = st.enemy.y + my;
        if (!st.walls.has(ey * st.cols + ex)) { st.enemy.x = ex; st.enemy.y = ey; break; }
      }
    }
    if (st.enemy.x === st.px && st.enemy.y === st.py) { setGameOver(true); return; }
    if (st.px === st.exit.x && st.py === st.exit.y) { setScore((sc) => sc + 1000); setGameOver(true); return; }
    st.reveal = st.reveal.filter((r) => (r.life -= dt) > 0);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    const ox = (size.w - st.cols * CELL) / 2, oy = (size.h - st.rows * CELL) / 2;
    const flash = st.reveal.some((r) => r.full);
    for (let y = 0; y < st.rows; y++) {
      for (let x = 0; x < st.cols; x++) {
        const i = y * st.cols + x;
        const dist = Math.max(Math.abs(x - st.px), Math.abs(y - st.py));
        const visible = flash || st.seen.has(i) || dist <= 1;
        if (!visible) continue;
        if (st.walls.has(i)) ctx.fillStyle = '#444';
        else if (x === st.exit.x && y === st.exit.y) ctx.fillStyle = '#0f0';
        else ctx.fillStyle = '#222';
        ctx.fillRect(ox + x * CELL, oy + y * CELL, CELL - 1, CELL - 1);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(ox + st.px * CELL, oy + st.py * CELL, CELL, CELL);
    const enemyDist = Math.max(Math.abs(st.enemy.x - st.px), Math.abs(st.enemy.y - st.py));
    if (flash || enemyDist <= 2) {
      ctx.fillStyle = '#f00';
      ctx.fillRect(ox + st.enemy.x * CELL, oy + st.enemy.y * CELL, CELL, CELL);
    }
  }, !gameOver && size.w > 0);

  const flash = () => {
    const st = s.current;
    if (!st || st.flashes <= 0) return;
    st.flashes--;
    setFlashesLeft(st.flashes);
    st.reveal.push({ full: true, life: 0.4 });
  };

  return (
    <GameShell gameId="25" title="Blackout Debugger" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint={`WASD · FLASH (${flashesLeft}) reveals briefly · Red hunts you`}>
      <canvas ref={canvasRef} className="game-canvas" />
      <button type="button" className="game-btn" style={{ position: 'absolute', bottom: 48, right: 16, zIndex: 8 }} onClick={flash}>FLASH</button>
    </GameShell>
  );
}
