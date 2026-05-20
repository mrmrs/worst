import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, rand, clamp } from './utils';

const COLORS = { r: '#f00', b: '#00f', g: '#0f0', y: '#ff0' };

export default function Game20() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [recipe, setRecipe] = useState({ r: 3, b: 2, y: 1 });
  const [bowl, setBowl] = useState({ r: 0, b: 0, g: 0, y: 0 });
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { drops: [], bowlX: size.w / 2 };
    setBowl({ r: 0, b: 0, g: 0, y: 0 });
    setRecipe({ r: 3, b: 2, y: 1 });
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    if (Math.random() < dt * 3) {
      const keys = Object.keys(COLORS);
      const k = keys[Math.floor(Math.random() * keys.length)];
      st.drops.push({ x: rand(20, size.w - 20), y: -10, c: k, fake: Math.random() < 0.2 });
    }
    st.drops = st.drops.filter((d) => {
      d.y += 100 * dt;
      if (d.y > size.h - 60 && Math.abs(d.x - st.bowlX) < 40) {
        if (d.fake || d.c === 'g') setGameOver(true);
        else setBowl((b) => ({ ...b, [d.c]: b[d.c] + 1 }));
        return false;
      }
      return d.y < size.h;
    });
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size.w, size.h);
    st.drops.forEach((d) => { ctx.fillStyle = COLORS[d.c]; ctx.fillRect(d.x, d.y, 8, 8); });
    ctx.fillStyle = '#444';
    ctx.fillRect(st.bowlX - 35, size.h - 50, 70, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.fillText(`need r${recipe.r} b${recipe.b} y${recipe.y}`, 8, 20);
    ctx.fillText(`bowl r${bowl.r} b${bowl.b} y${bowl.y}`, 8, 36);
    if (bowl.r >= recipe.r && bowl.b >= recipe.b && bowl.y >= recipe.y) {
      setScore((sc) => sc + 200);
      setRecipe({ r: rand(2, 5) | 0, b: rand(1, 4) | 0, y: rand(1, 3) | 0 });
      setBowl({ r: 0, b: 0, g: 0, y: 0 });
    }
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="20" title="Noise Chef" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Drag bowl · Catch recipe colors · No green">
      <canvas ref={canvasRef} className="game-canvas"
        onPointerMove={(e) => { if (s.current) s.current.bowlX = clamp(e.nativeEvent.offsetX, 40, size.w - 40); }}
      />
    </GameShell>
  );
}
