import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp, rand } from './utils';

const LAYERS = [
  { color: '#ff6464', size: 32, label: '◆' },
  { color: '#ffb464', size: 26, label: '▲' },
  { color: '#ffe864', size: 20, label: '●' },
];

export default function Game21() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { px: size.w / 2, py: size.h / 2, realLayer: 0, layerTimer: 4, obstacles: [] };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    if (keyDown(keys, 'a', 'arrowleft')) st.px -= 180 * dt;
    if (keyDown(keys, 'd', 'arrowright')) st.px += 180 * dt;
    if (keyDown(keys, 'w', 'arrowup')) st.py -= 180 * dt;
    if (keyDown(keys, 's', 'arrowdown')) st.py += 180 * dt;
    st.px = clamp(st.px, 16, size.w - 16);
    st.py = clamp(st.py, 16, size.h - 16);
    st.layerTimer -= dt;
    if (st.layerTimer <= 0) {
      st.realLayer = (st.realLayer + 1 + Math.floor(Math.random() * 2)) % 3;
      st.layerTimer = 3 + Math.random() * 2;
    }
    if (Math.random() < dt * 1.5) {
      st.obstacles.push({
        x: rand(30, size.w - 30), y: -30,
        layer: Math.floor(Math.random() * 3),
        vy: rand(80, 140),
      });
    }
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);

    // shadow direction reveals the real layer: real-layer shadows go DOWN, others go up/left
    const real = st.realLayer;
    st.obstacles = st.obstacles.filter((o) => {
      o.y += o.vy * dt;
      const layer = LAYERS[o.layer];
      const solid = o.layer === real;
      const parallax = (o.layer - real) * 18;
      const ox = o.x + parallax;
      const oy = o.y;
      // shadow always cast down-right from sun in real layer
      ctx.fillStyle = solid ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.15)';
      ctx.fillRect(ox + 6, oy + 6, layer.size, layer.size);
      ctx.fillStyle = solid ? layer.color : `${layer.color}80`;
      ctx.fillRect(ox - layer.size / 2, oy - layer.size / 2, layer.size, layer.size);
      ctx.fillStyle = solid ? '#000' : 'rgba(0,0,0,0.4)';
      ctx.font = `bold ${Math.floor(layer.size * 0.7)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.label, ox, oy);
      if (solid && Math.hypot(ox - st.px, oy - st.py) < layer.size / 2 + 6) setGameOver(true);
      return o.y < size.h + 40;
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    setScore((sc) => sc + dt * 15);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.px, st.py, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.fillText('only one layer drops sharp shadows', 8, size.h - 12);
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="21" title="Parallax Lie Detector" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint="WASD · Real layer has the dark shadow">
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
