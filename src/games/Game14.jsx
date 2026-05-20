import { useState, useEffect, useRef } from 'react';
import GameShell from '../components/GameShell';

const SHAPES = ['▪', '▫', '◆', '◇', '▲', '▼', '✦', '⬡'];
const PACK_SECS = 5;

function randomItem() {
  return { shape: SHAPES[Math.floor(Math.random() * SHAPES.length)], wiggle: Math.random() > 0.5 };
}

export default function Game14() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState(() => Array(24).fill(null));
  const [item, setItem] = useState(() => randomItem());
  const [wave, setWave] = useState(PACK_SECS);
  const [phase, setPhase] = useState('pack');
  const [seed, setSeed] = useState(0);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    if (gameOver || phase !== 'pack') return;
    const id = setInterval(() => {
      setWave((w) => {
        if (w > 1) return w - 1;
        setPhase('attack');
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver, phase, seed]);

  useEffect(() => {
    if (phase !== 'attack') return;
    const t = setTimeout(() => {
      const filled = gridRef.current.filter(Boolean).length;
      if (filled < 8) {
        setGameOver(true);
        return;
      }
      setScore((s) => s + filled * 20);
      setGrid(Array(24).fill(null));
      setItem(randomItem());
      setWave(PACK_SECS);
      setPhase('pack');
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const place = (i) => {
    if (phase !== 'pack' || grid[i] || gameOver) return;
    setGrid((g) => {
      const next = [...g];
      next[i] = item.shape;
      return next;
    });
    setItem(randomItem());
    setScore((s) => s + 10);
  };

  const restart = () => {
    setScore(0);
    setGrid(Array(24).fill(null));
    setItem(randomItem());
    setWave(PACK_SECS);
    setPhase('pack');
    setGameOver(false);
    setSeed((s) => s + 1);
  };

  return (
    <GameShell gameId="14" title="Live Inventory Tetris" score={score} gameOver={gameOver} finalScore={score} onRestart={restart} hint={phase === 'pack' ? `Pack 8+ before ${wave}s` : 'Under attack…'}>
      <div style={{ paddingTop: 56, padding: 12 }}>
        {item && phase === 'pack' && (
          <p style={{ textAlign: 'center', fontSize: 32, animation: item.wiggle ? 'pulse 0.2s infinite' : 'none', margin: '0 0 12px' }}>{item.shape}</p>
        )}
        {phase === 'attack' && (
          <p style={{ textAlign: 'center', fontSize: 14, color: '#f00', margin: '0 0 12px' }}>★ ATTACK ★</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, maxWidth: 360, margin: '0 auto' }}>
          {grid.map((cell, i) => (
            <button key={i} type="button" onClick={() => place(i)} disabled={phase !== 'pack'} style={{
              aspectRatio: 1, fontSize: 24, background: cell ? '#224' : '#111', border: '1px solid #333', color: '#fff', fontFamily: 'inherit',
            }}>{cell || ''}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
