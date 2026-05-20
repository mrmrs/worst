import { Link } from 'react-router-dom';
import { GAMES } from '../games/registry';

export default function Home() {
  return (
    <div className="home-page">
      <h1>worst.games</h1>
      <p className="sub">25 browser games · mobile & desktop · leaderboards</p>
      <ul className="game-list" style={{ marginBottom: 32 }}>
        <li>
          <Link to="/0000">
            <span className="num">00</span>
            <span>
              Do Not Click
              <br />
              <small style={{ opacity: 0.45, fontSize: 10 }}>Classic — survive as long as you can</small>
            </span>
          </Link>
        </li>
        <li>
          <Link to="/0001">
            <span className="num">00</span>
            <span>
              Emoji Movies
              <br />
              <small style={{ opacity: 0.45, fontSize: 10 }}>Classic — guess the film</small>
            </span>
          </Link>
        </li>
      </ul>
      <ul className="game-list">
        {GAMES.map((g) => (
          <li key={g.id}>
            <Link to={g.path}>
              <span className="num">{g.id}</span>
              <span>
                {g.title}
                <br />
                <small style={{ opacity: 0.45, fontSize: 10 }}>{g.desc}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
