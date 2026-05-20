import { useState } from 'react';
import GameShell from '../components/GameShell';

const LABELS = ['OK', 'Cancel', 'Submit', '???', 'Free', 'Trap'];

function makeTiles() {
  return Array.from({ length: 48 }, (_, i) => ({
    id: i,
    label: i === 0 ? 'START' : i === 47 ? 'EXIT' : LABELS[i % LABELS.length],
  }));
}

export default function Game07() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clicked, setClicked] = useState(() => new Set());
  const [tiles, setTiles] = useState(() => makeTiles());

  const handleClick = (id, e) => {
    if (gameOver) return;
    e.stopPropagation();
    if (clicked.has(id)) { setGameOver(true); return; }
    const next = new Set(clicked);
    next.add(id);
    if (id === 47) {
      setScore((s) => s + 500 + (48 - next.size) * 5);
      setGameOver(true);
      setClicked(next);
      return;
    }
    setScore((s) => s + 10);
    if (id !== 0 && Math.random() < 0.15) {
      const extra = Math.floor(Math.random() * 48);
      if (extra !== id && extra !== 0 && extra !== 47) next.add(extra);
    }
    setClicked(next);
  };

  const restart = () => {
    setScore(0);
    setClicked(new Set());
    setTiles(makeTiles());
    setGameOver(false);
  };

  return (
    <GameShell gameId="07" title="The Floor Is Previously Clicked" score={score} gameOver={gameOver} finalScore={score} onRestart={restart} hint="Reach EXIT · Clicked tiles become deadly">
      <div style={{ position: 'absolute', inset: 0, top: 48, overflow: 'auto', padding: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, alignContent: 'start' }}>
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={(e) => handleClick(t.id, e)}
            style={{
              padding: '14px 8px',
              fontSize: 10,
              fontFamily: 'inherit',
              border: '1px solid #333',
              background: clicked.has(t.id) ? '#400' : t.id === 47 ? '#040' : t.id === 0 ? '#004' : '#111',
              color: clicked.has(t.id) ? '#f66' : '#fff',
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
