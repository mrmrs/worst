import React, { useEffect, useState, useRef } from "react";
import "../App.css";

const App = () => {
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [count, setCount] = useState(0);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [usernameInput, setUsernameInput] = useState("");
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("highScore"), 10) || 0,
  );
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [inputMethod, setInputMethod] = useState("click");
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const startTime = useRef(Date.now());

  // Counts how many times the game is played to completion
  const durableObjectName = "WORST_GAME_HOME";
  const fetchCount = async () => {
    try {
      const response = await fetch(
        `https://ts-gen-count.adam-f8f.workers.dev/?name=${durableObjectName}`,
      );
      const data = await response.text();
      setCount(data);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };
  const handleIncrement = async () => {
    try {
      await fetch(
        `https://ts-gen-count.adam-f8f.workers.dev/increment?name=${durableObjectName}`,
        {
          method: "POST",
        },
      );
      fetchCount();
    } catch (error) {
      console.error("Error incrementing count:", error);
    }
  };

  const handleUsernameChange = (e) => {
    setUsernameInput(e.target.value);
  };

const handleButtonClick = () => {
  if (!gameOver) {
    const endTime = Date.now();
    const calculatedTimeTaken = endTime - startTime.current;  // Calculate it once and use this local constant
    setTimeTaken(calculatedTimeTaken);  // Still set it for any other needs
    setScore(calculatedTimeTaken);
    setGameOver(true);
    handleIncrement();

    // Check if new score is higher than the high score directly using calculatedTimeTaken
    if (calculatedTimeTaken > highScore) {
      localStorage.setItem("highScore", calculatedTimeTaken);
      setHighScore(calculatedTimeTaken);
      setIsNewHighScore(true); // Set the flag to true if it's a new high score
    } else {
      setIsNewHighScore(false); // Reset the flag if not a high score
    }

    const scoreData = {
      user: username,
      score: calculatedTimeTaken,
      timeTaken: calculatedTimeTaken,
    };

    submitScore(scoreData, 'daily');  // Now submitting the actual calculated time
  }
};

  const handleUsernameSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const newUsername = e.target.username.value;
    if (newUsername) {
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);
    }
  };


const submitScore = async (scoreData, category) => {
    const dataWithCategory = { ...scoreData, category };
    try {
        const response = await fetch('https://games-0000.adam-f8f.workers.dev/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataWithCategory)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        console.log("Score submitted successfully");
    } catch (error) {
        console.error("Failed to submit score:", error);
    }
};

const fetchScores = async (category) => {
  // The category should be either 'daily' or 'all-time'
  const url = `https://games-0000.adam-f8f.workers.dev/get-scores?category=${category}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scores = await response.json();
    return scores;
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return [];
  }
};

  useEffect(() => {
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

useEffect(() => {
  const loadScores = async () => {
    const fetchedDailyScores = await fetchScores('daily');
    const fetchedAllTimeScores = await fetchScores('all-time');
    setDailyScores(fetchedDailyScores);
    setAllTimeScores(fetchedAllTimeScores);
  };

  loadScores();
}, []);


  useEffect(() => {
    fetchCount();
    const timer = setInterval(() => {
      if (!gameOver) {
        const currentTime = Date.now();
        const timeTaken = currentTime - startTime.current;
        setScore(timeTaken);
        const newHistory = [...gameHistory, { score: timeTaken, timeTaken }];
        setGameHistory(newHistory);
      }
    }, 1);
    return () => clearInterval(timer);
  }, [gameOver]);



  useEffect(() => {
    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    ) {
      setInputMethod("tap");
    } else {
      setInputMethod("click");
    }
  }, []);

  return (
    <div
      className="text-color background-color"
      style={{
        textAlign: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p>WORST GAMES</p>
      <div
        style={{
          position: "relative",
          margin: "32px 0",
          height: "4rem",
          width: "16rem",
        }}
      >
        <button onClick={handleButtonClick} className="beacon animated-button">
          Do not {inputMethod}
        </button>
      </div>
      <p>{score}</p>
      {gameOver && (
        <div
          id="game-over-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "black",
            color: "yellow",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "red", fontSize: "48px", fontWeight: "bold" }}>
              GAME OVER
            </p>
            {!isNewHighScore && <p style={{ color: "white" }}>SCORE</p>}
            {isNewHighScore && (
              <p style={{ color: "white" }}>NEW HIGH SCORE!</p>
            )}
            {username ? (
              <p></p>
            ) : (
              <form onSubmit={handleUsernameSubmit}>
                <input
                  style={{
                    appearance: "none",
                    WebKitAppearance: "none",
                    borderRadius: 0,
                    border: "1px solid white",
                    color: "white",
                    background: "transparent",
                    padding: "8px",
                  }}
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  required
                  value={usernameInput}
                  onChange={handleUsernameChange}
                />
                <button
                  style={{
                    border: "1px solid currentColor",
                    background: "transparent",
                    color: "white",
                    padding: "8px",
                    marginLeft: "4px",
                  }}
                  type="submit"
                >
                  Submit
                </button>
              </form>
            )}
            <p style={{ fontWeight: "bold", fontSize: "96px", margin: 0 }}>
              {score}
            </p>
            <small style={{ fontSize: "10px", color: "#777" }}>
              This game has been played {count} times
            </small>
            <p style={{ marginTop: "64px" }}>Continue?</p>
            <button
              style={{ display: "inline-block", marginRight: "32px" }}
              onClick={() => window.location.reload()}
            >
              Yes
            </button>
            <button>No</button>
          </div>
      <h4>High Scores</h4>
      <ol style={{fontSize: '12px', padding: 0, marginTop: '32px', lineHeight: 1., lineHeight: 1.55, overflow: 'scroll', maxHeight: '20dvh' }}>
        {dailyScores.slice(0,10).map((score, index) => (
          <li key={index} style={{ fontSize: '10px', minWidth: '192px', padding: '2px 0', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
              <b style={{ display: 'inline-block', marginRight: '4px' }}>{score.user}</b> 
              <code>{score.score}</code>
          </li>
        ))}
      </ol>
        </div>
      )}
    </div>
  );
};

export default App;
