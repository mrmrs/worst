import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useLeaderboard';

function formatScore(score) {
  const n = typeof score === 'number' ? score : parseFloat(score);
  if (Number.isNaN(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(0);
}

export default function GameShell({
  gameId,
  title,
  score,
  hint,
  gameOver,
  finalScore,
  onRestart,
  children,
  controls,
}) {
  const lb = useLeaderboard(gameId);
  const displayScore = finalScore ?? score ?? 0;

  useEffect(() => {
    if (gameOver && gameId) {
      lb.onGameEnd(displayScore);
    }
  }, [gameOver, gameId, displayScore, lb.onGameEnd]);

  const handleRestart = () => {
    lb.resetSession();
    onRestart?.();
  };

  return (
    <div className="game-shell">
      <div className="game-hud">
        <Link to="/" className="game-hud-back">← worst</Link>
        <div className="game-hud-right">
          <div className="game-hud-score">{formatScore(score)}</div>
          <div className="game-hud-title">{title}</div>
        </div>
      </div>
      {children}
      {controls}
      {hint && !gameOver && <p className="game-hint">{hint}</p>}
      {gameOver && (
        <div className="game-over-modal">
          <div className="game-over-main">
            <p className="game-over-label">GAME OVER</p>
            <div className="game-over-score-box">
              {!lb.isNewHighScore && <p className="game-over-score-label">SCORE</p>}
              {lb.isNewHighScore && <p className="game-over-score-label">NEW HIGH SCORE!</p>}
              <p className="game-over-score-value">{formatScore(displayScore)}</p>
            </div>

            {gameId && !lb.username && lb.showUsernameForm && (
              <form className="game-over-username" onSubmit={lb.handleUsernameSubmit}>
                <label>
                  <span>Enter Username</span>
                  <input
                    autoComplete="off"
                    type="text"
                    name="username"
                    required
                    value={lb.usernameInput}
                    onChange={(e) => lb.setUsernameInput(e.target.value)}
                  />
                </label>
                <button type="submit">Submit</button>
              </form>
            )}

            <div className="game-over-actions">
              <p>Play Again?</p>
              <button type="button" className="game-btn" onClick={handleRestart}>Yes</button>
              <Link to="/" className="game-btn ghost">Menu</Link>
            </div>
          </div>

          {gameId && (
            <section className="game-over-leaderboards">
              <div className="game-over-lb-grid">
                <article>
                  <h5>Today</h5>
                  {lb.dailyScores.length > 0 ? (
                    <ol>
                      {lb.dailyScores.slice(0, 10).map((item, index) => (
                        <li key={`d-${index}`}>
                          <b>
                            <span>{index + 1}</span>
                            {item.user}
                          </b>
                          <code>{formatScore(item.score)}</code>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="game-over-lb-empty">—</p>
                  )}
                </article>
                <article>
                  <h5>All-time</h5>
                  {lb.allTimeScores.length > 0 ? (
                    <ol>
                      {lb.allTimeScores.slice(0, 10).map((item, index) => (
                        <li key={`a-${index}`}>
                          <b>
                            <span>{index + 1}</span>
                            {item.user}
                          </b>
                          <code>{formatScore(item.score)}</code>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="game-over-lb-empty">—</p>
                  )}
                </article>
              </div>
            </section>
          )}

          {gameId && (
            <footer className="game-over-footer">
              <small>{lb.count} plays</small>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
