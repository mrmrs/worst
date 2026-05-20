import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp } from './utils';

const GHOST_DELAY = 5;
const HISTORY_SEC = 60;

export default function Game22() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ghostCount, setGhostCount] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { px: size.w / 2, py: size.h / 2, history: [], ghosts: [], t: 0, nextGhost: GHOST_DELAY };
    setGameOver(false);
    setScore(0);
    setGhostCount(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.t += dt;
    if (keyDown(keys, 'a', 'arrowleft')) st.px -= 140 * dt;
    if (keyDown(keys, 'd', 'arrowright')) st.px += 140 * dt;
    if (keyDown(keys, 'w', 'arrowup')) st.py -= 140 * dt;
    if (keyDown(keys, 's', 'arrowdown')) st.py += 140 * dt;
    st.px = clamp(st.px, 12, size.w - 12);
    st.py = clamp(st.py, 12, size.h - 12);
    st.history.push({ x: st.px, y: st.py, t: st.t });
    const cutoff = st.t - HISTORY_SEC;
    while (st.history.length && st.history[0].t < cutoff) st.history.shift();
    if (st.t >= st.nextGhost) {
      st.ghosts.push({ offset: GHOST_DELAY });
      st.nextGhost = st.t + GHOST_DELAY;
      if (st.ghosts.length !== ghostCount) setGhostCount(st.ghosts.length);
    }
    setScore((sc) => sc + dt * 20);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    for (let gi = 0; gi < st.ghosts.length; gi++) {
      const g = st.ghosts[gi];
      const targetT = st.t - g.offset * (gi + 1);
      let pt = null;
      for (let i = st.history.length - 1; i >= 0; i--) {
        if (st.history[i].t <= targetT) { pt = st.history[i]; break; }
      }
      if (!pt) continue;
      const alpha = 0.5 - gi * 0.05;
      ctx.fillStyle = `rgba(255,0,0,${Math.max(0.15, alpha)})`;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2); ctx.fill();
      if (Math.hypot(pt.x - st.px, pt.y - st.py) < 14) setGameOver(true);
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.px, st.py, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`ghosts: ${st.ghosts.length}`, 12, 24);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="22" title="Tethered to Your Mistake" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint={`WASD · Ghosts (${ghostCount}) replay your every 5s`}>
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
