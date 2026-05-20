import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx } from './utils';

export default function Game17() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { t: 0, pos: 0, dir: 1, obstacles: [{ t: 0.5, spd: 0.1 }], gems: [{ t: 0.25 }, { t: 0.75 }], spawnCd: 4 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  const perimeter = (w, h) => 2 * (w + h);

  const posToXY = (pos, w, h) => {
    const p = pos % (2 * (w + h));
    if (p < w) return { x: p, y: 0 };
    if (p < w + h) return { x: w, y: p - w };
    if (p < 2 * w + h) return { x: 2 * w + h - p, y: h };
    return { x: 0, y: 2 * w + 2 * h - p };
  };

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver || !size.w) return;
    const perim = perimeter(size.w, size.h);
    st.pos = (st.pos + st.dir * 120 * dt + perim) % perim;
    st.obstacles.forEach((o) => {
      o.t = (o.t + o.spd * st.dir * dt + 1) % 1;
      if (Math.abs(o.t * perim - st.pos) < 20 || Math.abs(o.t * perim - st.pos) > perim - 20) setGameOver(true);
    });
    st.gems = st.gems.filter((g) => {
      if (Math.abs(g.t * perim - st.pos) < 25) { setScore((sc) => sc + 50); return false; }
      return true;
    });
    st.spawnCd -= dt;
    if (st.spawnCd <= 0 && st.obstacles.length < 6) {
      const spawnT = (st.pos / perim + 0.4 + Math.random() * 0.2) % 1;
      st.obstacles.push({ t: spawnT, spd: 0.08 + Math.random() * 0.08 });
      st.spawnCd = 2 + Math.random() * 2;
    }
    if (Math.random() < dt * 0.15 && st.gems.length < 4) {
      st.gems.push({ t: Math.random() });
    }
    setScore((sc) => sc + dt * 5);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#200';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.fillStyle = '#000';
    ctx.fillRect(8, 8, size.w - 16, size.h - 16);
    const p = posToXY(st.pos, size.w - 16, size.h - 16);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(p.x + 4, p.y + 4, 10, 10);
    st.obstacles.forEach((o) => {
      const xy = posToXY(o.t * perim, size.w - 16, size.h - 16);
      ctx.fillStyle = '#f00';
      ctx.fillRect(xy.x + 2, xy.y + 2, 12, 12);
    });
    st.gems.forEach((g) => {
      const xy = posToXY(g.t * perim, size.w - 16, size.h - 16);
      ctx.fillStyle = '#ff0';
      ctx.fillRect(xy.x + 4, xy.y + 4, 8, 8);
    });
  }, !gameOver && size.w > 0);

  const flip = () => { if (s.current) s.current.dir *= -1; };

  return (
    <GameShell gameId="17" title="Borderline" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint="Tap to reverse · Stay on the border · Void kills">
      <canvas ref={canvasRef} className="game-canvas" onClick={flip} />
    </GameShell>
  );
}
