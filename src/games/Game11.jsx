import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, clamp, rand } from './utils';

const WORDS = ['ESCAPE', 'SPIRAL', 'FRACTURE'];

export default function Game11() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  const word = WORDS[wordIdx % WORDS.length];

  useEffect(() => {
    if (!size.w) return;
    s.current = {
      px: size.w / 2, py: size.h * 0.75,
      letters: word.split('').map((ch, i) => ({
        ch, x: size.w / 2 + (i - word.length / 2) * 40, y: size.h * 0.35,
        vx: 0, vy: 0, active: false,
      })),
    };
    setTyped(0);
    setGameOver(false);
  }, [size.w, size.h, wordIdx, seed, word]);

  useEffect(() => {
    const onKey = (e) => {
      if (gameOver || !s.current) return;
      const next = word[typed];
      if (e.key.toUpperCase() === next) {
        const L = s.current.letters[typed];
        if (L) { L.active = true; L.vy = -80; L.vx = rand(-60, 60); }
        const nt = typed + 1;
        setTyped(nt);
        setScore((sc) => sc + 50);
        if (nt >= word.length) { setWordIdx((w) => w + 1); setScore((sc) => sc + 300); }
      } else {
        setGameOver(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [typed, word, gameOver]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.px = clamp(st.px + (st.dx || 0) * 200 * dt, 20, size.w - 20);
    st.letters.forEach((L) => {
      if (L.active) { L.x += L.vx * dt; L.y += L.vy * dt; L.vy += 120 * dt; }
      if (L.active && Math.hypot(L.x - st.px, L.y - st.py) < 28) setGameOver(true);
    });
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    st.letters.forEach((L) => {
      ctx.fillStyle = L.active ? '#f00' : '#fff';
      ctx.fillText(L.ch, L.x, L.y);
    });
    ctx.fillStyle = '#0ff';
    ctx.fillRect(st.px - 8, st.py - 8, 16, 16);
    ctx.font = '12px monospace';
    ctx.fillText(word.slice(typed), size.w / 2, size.h - 40);
    ctx.textAlign = 'left';
  }, !gameOver && size.w > 0);

  return (
    <GameShell gameId="11" title="Wound Around a Word" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Type letters · Each activates hazards · Dodge with ◀▶">
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="touch-controls">
        <button type="button" className="touch-btn" onTouchStart={() => { if (s.current) s.current.dx = -1; }} onTouchEnd={() => { if (s.current) s.current.dx = 0; }} onMouseDown={() => { if (s.current) s.current.dx = -1; }} onMouseUp={() => { if (s.current) s.current.dx = 0; }}>◀</button>
        <button type="button" className="touch-btn" onTouchStart={() => { if (s.current) s.current.dx = 1; }} onTouchEnd={() => { if (s.current) s.current.dx = 0; }} onMouseDown={() => { if (s.current) s.current.dx = 1; }} onMouseUp={() => { if (s.current) s.current.dx = 0; }}>▶</button>
      </div>
    </GameShell>
  );
}
