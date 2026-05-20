import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeys, keyDown } from '../hooks/useKeys';
import { setupCtx, clamp } from './utils';

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export default function Game24() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const keys = useKeys();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = { px: size.w / 2, py: size.h / 2, trail: [], lasers: [], straightTime: 0, lastAngle: null, laserCd: 0 };
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    const prev = { x: st.px, y: st.py };
    let moved = false;
    if (keyDown(keys, 'a', 'arrowleft')) { st.px -= 130 * dt; moved = true; }
    if (keyDown(keys, 'd', 'arrowright')) { st.px += 130 * dt; moved = true; }
    if (keyDown(keys, 'w', 'arrowup')) { st.py -= 130 * dt; moved = true; }
    if (keyDown(keys, 's', 'arrowdown')) { st.py += 130 * dt; moved = true; }
    st.px = clamp(st.px, 10, size.w - 10);
    st.py = clamp(st.py, 10, size.h - 10);
    st.trail.push({ x: st.px, y: st.py });
    if (st.trail.length > 80) st.trail.shift();
    st.laserCd -= dt;

    if (moved) {
      const angle = Math.atan2(st.py - prev.y, st.px - prev.x);
      if (st.lastAngle !== null) {
        const diff = Math.abs(((angle - st.lastAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (diff < 0.12) st.straightTime += dt;
        else st.straightTime = 0;
      }
      st.lastAngle = angle;
      if (st.straightTime > 0.6 && st.laserCd <= 0) {
        const t0 = st.trail[Math.max(0, st.trail.length - 20)];
        st.lasers.push({ x1: t0.x, y1: t0.y, x2: st.px, y2: st.py, life: 2 });
        st.laserCd = 0.5;
        st.straightTime = 0;
      }
    } else {
      st.straightTime = 0;
      st.lastAngle = null;
    }

    st.lasers = st.lasers.filter((l) => {
      l.life -= dt;
      if (distToSegment(st.px, st.py, l.x1, l.y1, l.x2, l.y2) < 8) setGameOver(true);
      return l.life > 0;
    });

    setScore((sc) => sc + dt * 25);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    st.trail.forEach((p, i) => {
      ctx.fillStyle = `rgba(255,255,255,${i / st.trail.length * 0.3})`;
      ctx.fillRect(p.x, p.y, 2, 2);
    });
    st.lasers.forEach((l) => {
      ctx.strokeStyle = `rgba(255,0,0,${Math.min(1, l.life)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    });
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(st.px, st.py, 5, 0, Math.PI * 2); ctx.fill();
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="24" title="The Game Hates Straight Lines" score={Math.floor(score)} gameOver={gameOver} finalScore={Math.floor(score)} onRestart={() => setSeed((x) => x + 1)} hint="WASD · Vary your path · Straight motion forges lasers">
      <canvas ref={canvasRef} className="game-canvas" />
    </GameShell>
  );
}
