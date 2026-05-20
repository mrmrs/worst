import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx, rand } from './utils';

export default function Game09() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [seed, setSeed] = useState(0);
  const [hp, setHp] = useState(3);
  const s = useRef(null);

  useEffect(() => {
    if (!size.w) return;
    s.current = {
      px: size.w / 2, py: size.h / 2,
      oracle: { x: rand(40, size.w - 40), y: rand(40, size.h - 40), life: 2, visible: false, flicker: 0 },
      decoys: [],
      hp: 3,
    };
    setHp(3);
    setGameOver(false);
    setScore(0);
  }, [size.w, size.h, seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.oracle.life -= dt;
    st.oracle.flicker += dt;
    st.oracle.visible = Math.sin(st.oracle.flicker * 12) > 0.6;
    if (st.oracle.life <= 0) {
      st.oracle = {
        x: rand(40, size.w - 40), y: rand(40, size.h - 40),
        life: 1.5 + Math.random(), visible: false, flicker: 0,
      };
      for (let i = 0; i < 4; i++) {
        st.decoys.push({ x: rand(20, size.w - 20), y: rand(20, size.h - 20), life: 0.4 + Math.random() * 0.3 });
      }
    }
    st.decoys = st.decoys.filter((d) => (d.life -= dt) > 0);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * size.w | 0;
      const y = Math.random() * size.h | 0;
      const v = (Math.random() * 3) | 0;
      ctx.fillStyle = v === 0 ? '#222' : v === 1 ? '#666' : '#aaa';
      ctx.fillRect(x, y, 2, 2);
    }
    if (st.oracle.visible) {
      ctx.fillStyle = '#f00';
      ctx.fillRect(st.oracle.x - 1, st.oracle.y - 1, 3, 3);
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.fillRect(st.oracle.x - 4, st.oracle.y - 4, 9, 9);
    }
    st.decoys.forEach((d) => { ctx.fillStyle = '#f00'; ctx.fillRect(d.x, d.y, 3, 3); });
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(st.px - 14, st.py - 14, 28, 28);
    ctx.fillStyle = '#0ff';
    ctx.fillRect(st.px - 1, st.py - 1, 3, 3);
  }, !gameOver && size.w > 0);

  const activate = () => {
    const st = s.current;
    if (!st) return;
    const onOracle = Math.hypot(st.px - st.oracle.x, st.py - st.oracle.y) < 18;
    if (onOracle && st.oracle.visible) {
      setScore((sc) => sc + 100);
      st.oracle.life = 0;
    } else {
      st.hp--;
      setHp(st.hp);
      if (st.hp <= 0) setGameOver(true);
    }
  };

  return (
    <GameShell gameId="09" title="Static Oracle" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint={`HP ${hp} · Drag reticle · Tap when red dot pulses inside it`}>
      <canvas ref={canvasRef} className="game-canvas"
        onPointerMove={(e) => { if (s.current) { s.current.px = e.nativeEvent.offsetX; s.current.py = e.nativeEvent.offsetY; } }}
        onClick={activate}
      />
    </GameShell>
  );
}
