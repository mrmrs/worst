import { useRef, useState, useEffect } from 'react';
import GameShell from '../components/GameShell';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useGameLoop } from '../hooks/useGameLoop';
import { setupCtx } from './utils';

export default function Game08() {
  const canvasRef = useRef(null);
  const size = useCanvasSize(canvasRef);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [seed, setSeed] = useState(0);
  const s = useRef(null);

  useEffect(() => {
    s.current = { pulse: 0, target: 8, bpm: 90, round: 0, misses: 0 };
    setGameOver(false);
    setScore(0);
    setFeedback('');
  }, [seed]);

  useGameLoop((dt) => {
    const st = s.current;
    const canvas = canvasRef.current;
    if (!st || !canvas || gameOver) return;
    st.pulse += dt * (st.bpm / 60);
    const ctx = canvas.getContext('2d');
    setupCtx(ctx, size.dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size.w, size.h);
    const beat = st.pulse % 1;
    const r = 40 + Math.sin(beat * Math.PI * 2) * 30;
    ctx.strokeStyle = beat < 0.1 ? '#fff' : '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size.w / 2, size.h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
    const count = Math.floor(st.pulse) + 1;
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Click on pulse ${st.target}`, size.w / 2, size.h / 2 + 80);
    ctx.fillStyle = count === st.target ? '#0f0' : '#888';
    ctx.fillText(`Beat: ${count}`, size.w / 2, size.h / 2 - 60);
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    ctx.fillText(`Misses: ${st.misses}/3`, size.w / 2, size.h - 60);
    if (feedback) {
      ctx.fillStyle = feedback === 'PERFECT' ? '#0f0' : '#f44';
      ctx.font = '14px monospace';
      ctx.fillText(feedback, size.w / 2, size.h - 40);
    }
    ctx.textAlign = 'left';
  }, !gameOver && size.w > 0);

  const click = () => {
    const st = s.current;
    if (!st || gameOver) return;
    const count = Math.floor(st.pulse) + 1;
    const frac = st.pulse % 1;
    const onBeat = frac < 0.15 || frac > 0.85;
    if (count === st.target && onBeat) {
      setScore((sc) => sc + 100);
      setFeedback('PERFECT');
      st.target = count + 4 + Math.floor(Math.random() * 8);
      st.bpm = Math.min(200, st.bpm + 5);
      st.round++;
    } else {
      const offBeats = count - st.target;
      const ms = Math.round((onBeat ? 0 : Math.min(frac, 1 - frac) * (60000 / st.bpm)));
      setFeedback(offBeats !== 0 ? `${offBeats > 0 ? '+' : ''}${offBeats} beat${Math.abs(offBeats) === 1 ? '' : 's'}` : `${ms}ms off`);
      st.misses++;
      if (st.misses >= 3) { setGameOver(true); return; }
    }
    setTimeout(() => setFeedback(''), 700);
  };

  return (
    <GameShell gameId="08" title="Impossible Stopwatch" score={score} gameOver={gameOver} finalScore={score} onRestart={() => setSeed((x) => x + 1)} hint="Tap on the target pulse when the ring flashes">
      <canvas ref={canvasRef} className="game-canvas" onClick={click} onTouchStart={(e) => { e.preventDefault(); click(); }} />
    </GameShell>
  );
}
