import React, { useEffect, useState, useRef } from "react";
import "../App.css";

const emojis = ["😀", "😂", "😍", "😎", "😢", "😡", "🤔", "🥳", "😴", "🤩"];


const App = () => {
 const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [fallingEmojis, setFallingEmojis] = useState([]);
  const [bottomEmojis, setBottomEmojis] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [usernameInput, setUsernameInput] = useState("");
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("highScore"), 10) || 0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMethod, setInputMethod] = useState("click");
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [missedEmojis, setMissedEmojis] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const startTime = useRef(Date.now());
  const durableObjectName = "WORST_GAME_TEST";

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
// Timer logic
  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            handleIncrement();
            if (score > highScore) {
              localStorage.setItem("highScore", score);
              setHighScore(score);
              setIsNewHighScore(true);
            } else {
              setIsNewHighScore(false);
            }
            const scoreData = {
              user: username,
              score: score,
              timeTaken: 60 - timeLeft,
            };
            if (!username) {
              setIsUsernameModalOpen(true);
            } else {
              submitScore(scoreData, 'daily');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver, score, highScore, timeLeft, username]);

// Falling emojis logic
  useEffect(() => {
    if (!gameOver) {
      const fallInterval = setInterval(() => {
        const newEmoji = {
          id: Date.now(),
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          left: Math.floor(Math.random() * 90) + 5,
        };
        setFallingEmojis((prev) => [...prev, newEmoji]);
        setTimeout(() => {
          setFallingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
          setMissedEmojis((prev) => prev + 1);
        }, 3000);
      }, 500);
      return () => clearInterval(fallInterval);
    }
  }, [gameOver]);

  // Bottom emojis logic
  useEffect(() => {
    const newBottomEmojis = Array.from({ length: 8 }, () =>
      emojis[Math.floor(Math.random() * emojis.length)]
    );
    setBottomEmojis(newBottomEmojis);
  }, [fallingEmojis]);

 const handleEmojiClick = (emoji) => {
    if (!gameOver) {
      const isMatch = fallingEmojis.some((e) => e.emoji === emoji);
      if (isMatch) {
        setScore((prev) => prev + 10 + correctStreak * 2);
        setCorrectStreak((prev) => prev + 1);
      } else {
        setScore((prev) => prev - 5);
        setCorrectStreak(0);
        setWrongTaps((prev) => prev + 1);
      }
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

    if(!username) {
      setIsUsernameModalOpen(true);
    } else {
      submitScore(scoreData, 'daily');  // Now submitting the actual calculated time
    }
  }
};

const handleUsernameSubmit = (e) => {
  e.preventDefault(); // Prevent default form submission behavior
  const newUsername = e.target.username.value;
  if (newUsername) {
    localStorage.setItem("username", newUsername);
    setUsername(newUsername);
    setIsUsernameModalOpen(false); // Close the modal

    // Submit the score now that the username is set
    submitScore({
      user: newUsername,
      score: score,
      timeTaken: timeTaken,
    }, 'daily');
  }
};

 const calculateScore = () => {
    return score + correctStreak * 5 - missedEmojis * 2 - wrongTaps * 3;
  };


const submitScore = async (scoreData, category) => {
    const dataWithCategory = { ...scoreData, category };
    try {
        const response = await fetch('https://games-0001.adam-f8f.workers.dev/submit-score', {
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
        
        // Refetch scores after successful submission
        const fetchedDailyScores = await fetchScores('daily');
        const fetchedAllTimeScores = await fetchScores('all-time');
        setDailyScores(fetchedDailyScores);
        setAllTimeScores(fetchedAllTimeScores);
    } catch (error) {
        console.error("Failed to submit score:", error);
    }
};

const fetchScores = async (category) => {
  // The category should be either 'daily' or 'all-time'
  const url = `https://games-0001.adam-f8f.workers.dev/get-scores?category=${category}`;

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
      className="game-container text-color background-color"
      style={{
        textAlign: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: 'hidden',
      }}
    >
<div className="score">Score: {score}</div>
      <div className="time-left">Time Left: {timeLeft}s</div>
      <div className="falling-emojis">
        {fallingEmojis.map((emoji) => (
          <div
            key={emoji.id}
            className="falling-emoji"
            style={{ left: `${emoji.left}%` }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>
      <div className="bottom-emojis">
        {bottomEmojis.map((emoji, index) => (
          <button key={index} onClick={() => handleEmojiClick(emoji)}>
            {emoji}
          </button>
        ))}
      </div>
      {gameOver && (
        <div
          id="game-over-modal"
          style={{
            textTransform: 'uppercase',
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
            background: "black",
            color: "yellow",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: 'hidden', 
          }}
        >
          <div style={{ textAlign: "center", paddingTop: '16px', height: '100%'  }}>
            <p style={{ color: "red", fontSize: "16px", fontWeight: "400", margin: '0 0 16px 0'  }}>
              GAME OVER
            </p>
        <div style={{  display: 'flex', height: '100%', alignItems: 'center', flexDirection: 'column', justifyContent: 'center'  }}>
        <div style={{ background: 'white', color: 'black', padding: '8px 24px', width: 'auto', maxWidth: '640px', transform: 'rotate(-4deg)', marginBottom: '16px' }}>
            <div>
              {!isNewHighScore && <p style={{ fontSize: '10px', margin: '0 0 2px 0', }}>SCORE</p>}
              {isNewHighScore && (
                <p style={{ display: 'flex', alignItems: 'center', fontSize: '10px', margin: '0 0 2px 0', textAlign: 'center', justifyContent: 'center' }}>NEW HIGH SCORE!</p>
              )}
              <p style={{ fontWeight: "bold", fontSize: "64px", margin: '8px 0 0 0', lineHeight: 0.9, }}>
                {score}
              </p>
          </div>
        </div>
            {username ? (
              <p></p>
            ) : (
              <div style={{ maxWidth: '100%' }}>
               <form onSubmit={handleUsernameSubmit} style={{ padding: '0 0px', marginTop: '16px', marginBottom: '16px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', width: '90%', display: 'flex', alignItems: 'flex-end',  justifyContent: 'center'}}>
              <label style={{ alignSelf: 'center',  fontSize: '10px', display: 'flex', alignItems: 'center', width: '64px', paddingRight: '8px',  maxWidth: '100%', textAlign: 'right' }}>
              <span>Enter Username</span>
              </label>
                <input
                  autoComplete='off'
                  type="text"
                  name="username"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ textTransform:'uppercase', maxWidth: '100%', width: '12ch',fontSize: '24px', border: '1px solid currentColor', background: 'transparent',  color: 'inherit', fontWeight: 900, padding: '8px',  }}
                />
              <button type="submit" style={{ appearance: 'none', WebkitAppearance: 'none', fontWeight: 900, background: 'yellow', padding: '8px 12px', border: 0, height: '46px', fontSize: '12px',  }}>Submit</button>
            </form>
              </div>
            )}
        <div style={{ width: '48%', padding: "4px 0px 4px 4px", margin: '0 16px', maxWidth: '256px', outline: '1px solid transparent', alignSelf: 'center', color: 'limegreen', display: 'flex', alignItems: 'center', justifyContent: 'space-between',  }}>
            <p style={{ margin: 0, fontSize: '14px', }}>Continue?</p>
            <button
              style={{ appearance: 'none', WebkitAppearance: 'none', display: "inline-block", marginLeft: 'auto', marginRight: "0px", background: 'limegreen', color :'black', border: 0,   }}
              onClick={() => window.location.reload()}
            >
              Yes
            </button>
            <button style={{ appearance: 'none',WebkitAppearance: 'none', border: 0, boxShadow: '0 0 0 1px transparent', background: 'transparent', color: 'limegreen', padding: '0 16px' }} >No</button>
        </div>
          </div>
        </div>
      <section style={{ marginBottom: '8px' }}>
      <div style={{ maxWidth: '512px', margin: '0 auto 20px auto', color: 'gold', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 16px'}}>

        <article>
        <h5 style={{ margin: 0, fontSize: '12px', background: 'gold', color: 'black' }}>Today</h5>
        {dailyScores.length > 0 &&
          <ol style={{fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1., lineHeight: 1.55, overflow: 'scroll', maxHeight: '100%' }}>
            {dailyScores.slice(0,10).map((score, index) => (
              <li key={index} style={{ margin: 0, fontSize: '10px', width: '100%',padding: '2px 0', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              <b style={{ display: 'inline-block', marginRight: '4px' }}>
              <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: .5 }}>{index+1}</span>
                {score.user}
              </b> 
                  <code>{score.score}</code>
              </li>
            ))}
          </ol>
        }
        </article>
      <article style={{ color: 'gold' }}>
        <h5 style={{ margin: 0, fontSize: '12px', background: 'gold', color: 'black' }}>All-time</h5>
        <ol style={{fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1., lineHeight: 1.55, overflow: 'scroll', maxHeight: '100%' }}>
          {allTimeScores.slice(0,10).map((score, index) => (
            <li key={index} style={{ fontSize: '10px', padding: '2px 0', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
            <b style={{ display: 'inline-block', marginRight: '4px' }}>
              <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: .5 }}>{index+1}</span>
            {score.user}

            </b> 
                <code>{score.score}</code>
            </li>
          ))}
        </ol>
        </article>
        </div>
        </section>
            <small style={{ fontSize: "10px", color: "#777", position: 'absolute', bottom: 0, right: 0, left: 0, padding: '6px 0' }}>
              {count} plays
            </small>
        </div>
      )}
    </div>
  );
};

export default App;
