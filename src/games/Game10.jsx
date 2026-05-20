import { useState, useEffect, useRef } from 'react';
import GameShell from '../components/GameShell';

const ROUNDS = [
  { q: 'Select all squares with traffic lights', correct: [1, 4, 7], labels: ['🚦', '🌳', '🚗', '🚦', '🏠', '⬜', '🚦', '🔲', '🚦'] },
  { q: 'Select circles pretending to be squares', correct: [0, 5], labels: ['◯□', '■', '●', '▢', '⬜', '○■', '■', '□', '◯'] },
  { q: 'Click only the OK tiles', correct: [0, 3, 4, 7, 8], labels: ['OK', 'AVOID', 'AVOID', 'OK', 'OK', 'AVOID', 'AVOID', 'OK', 'OK'] },
  { q: 'Select all even digits', correct: [1, 3, 5, 7], labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { q: 'Select all primes', correct: [1, 2, 4, 6], labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
];

const ROUND_SECS = 8;

export default function Game10() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(new Set());
  const [time, setTime] = useState(ROUND_SECS);
  const [seed, setSeed] = useState(0);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;

  const r = ROUNDS[round % ROUNDS.length];
  const rRef = useRef(r);
  rRef.current = r;

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setTime((x) => {
        if (x > 1) return x - 1;
        const cur = pickedRef.current;
        const cr = rRef.current;
        const correctSet = new Set(cr.correct);
        const wrong = [...cur].some((p) => !correctSet.has(p)) || cr.correct.some((c) => !cur.has(c));
        if (wrong) {
          setGameOver(true);
        } else {
          setScore((s) => s + 150);
          setRound((rr) => rr + 1);
          setPicked(new Set());
        }
        return ROUND_SECS;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver, seed]);

  const toggle = (i) => {
    if (gameOver) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const restart = () => {
    setScore(0);
    setRound(0);
    setPicked(new Set());
    setTime(ROUND_SECS);
    setGameOver(false);
    setSeed((s) => s + 1);
  };

  return (
    <GameShell gameId="10" title="Reflex CAPTCHA" score={score} gameOver={gameOver} finalScore={score} onRestart={restart} hint={`${time}s — ${r.q}`}>
      <div style={{ padding: 16, paddingTop: 56, height: '100%', overflow: 'auto' }}>
        <p style={{ fontSize: 11, marginBottom: 12, background: '#222', padding: 8 }}>{r.q}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {r.labels.map((label, i) => (
            <button key={i} type="button" onClick={() => toggle(i)} style={{
              aspectRatio: 1, fontSize: 20, border: '1px solid #444',
              background: picked.has(i) ? '#224' : '#111', color: '#fff', fontFamily: 'inherit',
            }}>{label}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
