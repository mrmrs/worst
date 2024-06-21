import React, { useEffect, useState, useRef } from "react";
import "../App.css";

const emojiMovies = [
  { emojis: "💍🌋🦅", title: "The Lord of the Rings: The Return of the King" },
  { emojis: "🎅", title: "The Santa Clause" },
  { emojis: "🚕🪞", title: "Taxi Driver" },
  { emojis: "🥊", title: "Rocky" },
  { emojis: "👽🦆", title: "Howard the Duck" },
  { emojis: "🐶🐕🐈‍⬛⛰️🐻🏡", title: "Homeward Bound" },
  { emojis: "🐭🍝", title: "Ratatouille" },
  { emojis: "👻🖼️", title: "Ghostbusters" },
  { emojis: "🛏️🐴", title: "The Godfather" },
  { emojis: "🥷👽", title: "Alien vs. Ninja" },
  { emojis: "💼🍔", title: "Pulp Fiction" },
  { emojis: "🐢🍕", title: "Teenage Mutant Ninja Turtles" },
  { emojis: "🦕🧬", title: "Jurassic Park" },
  { emojis: "⚡️🦉", title: "Harry Potter" },
  { emojis: "🚢🧊", title: "Titanic" },
  { emojis: "👑🦁", title: "The Lion King" },
  { emojis: "🕺😈🌘", title: "Batman" },
  { emojis: "👻🎥😂", title: "Scary Movie" },
  { emojis: "👸🕯️🫖🕰️🌹🐗", title: "Beauty and the Beast" },
  { emojis: "😱", title: "Scream" },
  { emojis: "👧🔄👩", title: "Freaky Friday" },
  { emojis: "👩🧛🐺", title: "Twighlight" },
  { emojis: "👽🤵", title: "Men in Black" },
  { emojis: "👽🏀", title: "Spacejam" },
  { emojis: "👽💦", title: "Signs" },
  { emojis: "👽🔊", title: "Mars Attacks" },
  { emojis: "👽📞🏠", title: "E.T. the Extra-Terrestrial" },
  { emojis: "🧟🎡", title: "Zombieland" },
  { emojis: "👻🚫", title: "Ghostbusters" },
  { emojis: "🔍🐠", title: "Finding Nemo" },
  { emojis: "👩‍🚀🌌🌎", title: "Gravity" },
  { emojis: "🌽🚀📚", title: "Interstellar" },
  { emojis: "🐇🥋", title: "The Matrix" },
  { emojis: "🔥📖", title: "Fahrenheit 451" },
  { emojis: "🧜🦵🦀", title: "The Little Mermaid" },
  { emojis: "🤠🤖", title: "Toy Story" },
  { emojis: "👽🤠", title: "Cowboys and Aliens" },
  { emojis: "🏎️🤕🚦🍽️", title: "Days of Thunder" },
  { emojis: "🧸🍯🐅🫏", title: "Winnie the Pooh" },
  { emojis: "🔨⚡", title: "Thor" },
  { emojis: "💃🐺", title: "Dances with Wolves" },
  { emojis: "💀🎁", title: "Se7en" },
  { emojis: "🧗‍♂️☠️🛩️💰🗻🔎", title: "Cliffhanger" },
  { emojis: "👀💰", title: "Jerry Maguire" },
  { emojis: "🚢🧊", title: "Titanic" },
  { emojis: "🎤🧛", title: "Interview with the Vampire" },
  { emojis: "🕴️🚢💥🔍", title: "The Usual Suspects" },
  { emojis: "💎🥊🐖🚚", title: "Snatch" },
  { emojis: "✈️", title: "Airplane" },
  { emojis: "⛳️🧨", title: "Caddyshack" },
  { emojis: "👀👻", title: "The Sixth Sense" },
  { emojis: "🎃🔪", title: "Halloween" },
  { emojis: "🕊️🦅🦆🦜🐥🦢🐓🦃🦉🦤🦩🪿", title: "Birds" },
  { emojis: "🌪️👠🦁", title: "The Wizard of Oz" },
  { emojis: "👦🐬", title: "Flipper" },
  { emojis: "👽🐈", title: "Alien" },
  { emojis: "👽👽", title: "Aliens" },
  { emojis: "🌖⛏️🤖", title: "Moon" },
  { emojis: "🗣🎶☔️", title: "Singin' in the Rain" },
  { emojis: "🚀🦍🦧🗽😭", title: "Planet of the Apes" },
  { emojis: "🏝🗺❌🏴‍☠️💰", title: "Treasure Island" },
  { emojis: "🚑📸☕️🤝☠️", title: "Heat" },
  { emojis: "🏦🏒🍀🏟️🥤🍊", title: "The Town" },
  { emojis: "🏄🏦🪂", title: "Point Break" },
  { emojis: "👃❄️💸🚓", title: "Blow" },
  { emojis: "🏨🃏💰🍸", title: "Casino Royale" },
  { emojis: "👶🚫", title: "Children of Men" },
  { emojis: "Ⓜ️", title: "M" },
  { emojis: "🧚‍♀️🌌🗡️🪝🐊", title: "Hook" },
  { emojis: "🚗💊🎉👮‍♂️", title: "Go" },
  { emojis: "☕️📞📇💼🥇", title: "Glengarry Glen Ross" },
  { emojis: "🤠💊🏥💵", title: "Dallas Buyers Club" },
  { emojis: "🧬🏊🏊🌊", title: "Gattaca" },
  { emojis: "⏱️👽☠️🔄", title: "Edge of Tomorrow" },
  { emojis: "👨‍🔬📚⚡🧟‍♂️", title: "Frankenstein" },
  { emojis: "🚿🔪🏨", title: "Psycho" },
  { emojis: "🕵️🕯️🔧🔪🏠", title: "Clue" },
  { emojis: "⛳️✈️🕒🐰", title: "Donnie Darko" },
  { emojis: "🎸👸🚗", title: "Wayne's World" },
  { emojis: "🧗👹🕳️🔦", title: "The Descent" },
  { emojis: "🚗📱", title: "Locke" },
  { emojis: "🦞❤️", title: "The Lobster" },
  { emojis: "🚗📹📰💵", title: "Nightcrawler" },
  { emojis: "🥁", title: "Whiplash" },
  { emojis: "🧛🏠📹😂", title: "What we do in the Shadows" },
  { emojis: "🐥⚡️🎩🔴", title: "The Prestige" },
  { emojis: "⚾️🌽👻", title: "Field of Dreams" },
  { emojis: "✈️📦🏝️🏐", title: "Castaway" },
  { emojis: "🛗🚌💣🚇", title: "Speed" },
  { emojis: "🚗🚙🏁", title: "Cars" },
  { emojis: "🐉❤️", title: "Dragonheart" },
  { emojis: "🌋🌆🌊", title: "Volcano" },
  { emojis: "🌋🌲🚁", title: "Dante's Peak" },
  { emojis: "🚀💣☀️", title: "Sunshine" },
  { emojis: "🐖🕷️🕸️", title: "Charlotte's Web" },
  { emojis: "🛫🚂🚗", title: "Planes, Trains, and Automobiles" },
  { emojis: "💵⚾️", title: "Moneyball" },
  { emojis: "💧🌎🗺️🏝️", title: "Waterworld" },
  { emojis: "🛢️⛪️🎳🥤", title: "There Will Be Blood" },
  { emojis: "🎅🎄🎃💀", title: "The nightmare Before Christmas" },
  { emojis: "🌀🪚", title: "Saw" },
  { emojis: "🐵⬛🚀🔴👶🏻", title: "2001: A Space Odessy" },
  { emojis: "🚗🐕🚓🎢👊🏻", title: "National Lampoon's Vacation" },  
  { emojis: "🤡🏦🚌🦇🪙", title: "Dark Knight" },  
];


const shuffleArray = (array) => {
  let shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const App = () => {
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [count, setCount] = useState(0);
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(Math.floor(Math.random() * emojiMovies.length));
  const [userGuess, setUserGuess] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [lastGuessResult, setLastGuessResult] = useState(null);
  const [shuffledMovies, setShuffledMovies] = useState(shuffleArray(emojiMovies));
  const [choices, setChoices] = useState([]);
  const [streak, setStreak] = useState(0);

  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [usernameInput, setUsernameInput] = useState("");
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("highScore"), 30) || 0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [inputMethod, setInputMethod] = useState("click");
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const startTime = useRef(Date.now());
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [pointsAnimation, setPointsAnimation] = useState(null);


  const durableObjectName = "WORST_GAME_0001";
  
  const fetchCount = async () => {
    try {
      const response = await fetch(`https://ts-gen-count.adam-f8f.workers.dev/?name=${durableObjectName}`);
      const data = await response.text();
      setCount(data);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const handleIncrement = async () => {
    try {
      await fetch(`https://ts-gen-count.adam-f8f.workers.dev/increment?name=${durableObjectName}`, { method: "POST" });
      fetchCount();
    } catch (error) {
      console.error("Error incrementing count:", error);
    }
  };

  const handleUsernameChange = (e) => {
    setUsernameInput(e.target.value);
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const newUsername = e.target.username.value;
    if (newUsername) {
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);
      setIsUsernameModalOpen(false);
      submitScore({ user: newUsername, score: score.toFixed(3), timeTaken: timeTaken }, 'daily');
    }
  };

  const submitScore = async (scoreData, category) => {
    const dataWithCategory = { ...scoreData, category };
    try {
      const response = await fetch('https://games-0001.adam-f8f.workers.dev/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithCategory),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const fetchedDailyScores = await fetchScores('daily');
      const fetchedAllTimeScores = await fetchScores('all-time');
      setDailyScores(fetchedDailyScores);
      setAllTimeScores(fetchedAllTimeScores);
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  };

const fetchScores = async (category) => {
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
        const newHistory = [...gameHistory, { score: timeTaken, timeTaken }];
        setGameHistory(newHistory);
        setTimeLeft((prev) => prev - 1);
        if (timeLeft <= 0) {
          clearInterval(timer);
          setGameOver(true);
          handleIncrement();
          submitScore({ user: username, score: score, timeTaken: 30 - timeLeft }, 'daily');
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, timeLeft, gameHistory, score]);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
      setInputMethod("tap");
    } else {
      setInputMethod("click");
    }
  }, []);



const levenshteinDistance = (a, b) => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateAccuracy = (guess, title) => {
  if (!guess) return 0;

  const distance = levenshteinDistance(guess.toLowerCase(), title.toLowerCase());
  const maxLength = Math.max(guess.length, title.length);
  const accuracy = ((maxLength - distance) / maxLength) * 100;

  console.log(`Guess: "${guess}", Title: "${title}", Distance: ${distance}, Max Length: ${maxLength}, Accuracy: ${accuracy}`);

  return Math.max(0, Math.min(100, accuracy));
};

//useEffect(() => {
//  // This code runs only when currentEmojiIndex changes
//  const currentEmoji = shuffledMovies[currentEmojiIndex];
//  console.log(`Now guessing: ${currentEmoji.title}`);
//}, [currentEmojiIndex]);

const pickChoices = (correctIndex) => {
  let correctOption = shuffledMovies[correctIndex]; // Get correct answer from shuffledMovies
  let options = [correctOption]; // Include correct answer
  let indices = new Set([correctIndex]); // To avoid duplicates

  while (options.length < 6) { // Limit to 6 options
    const randomIndex = Math.floor(Math.random() * emojiMovies.length);
    if (!indices.has(randomIndex)) {
      options.push(emojiMovies[randomIndex]);
      indices.add(randomIndex);
    }
  }
  return shuffleArray(options); // Shuffle to randomize position of correct answer
};

useEffect(() => {
  setChoices(pickChoices(currentEmojiIndex));
}, [currentEmojiIndex]);


const handleGuessSubmit = (guess) => {
  const endTime = Date.now();
  const calculatedTimeTaken = endTime - startTime.current;
  setTimeTaken(calculatedTimeTaken);

  const correctTitle = shuffledMovies[currentEmojiIndex].title;
  const isCorrect = guess === correctTitle;
  const timeScore = Math.max(0, 30 - calculatedTimeTaken / 1000); // Adjust scoring as needed
  let totalScore = isCorrect ? timeScore : -timeScore; // Penalty for wrong answers

  if (isCorrect) {
    setStreak(streak + 1);
    totalScore += 5 * streak; // Streak bonus
  } else {
    setStreak(0);
  }

  setScore(score + totalScore);
  setLastGuessResult({ accuracy: isCorrect ? 100 : 0, time: calculatedTimeTaken.toFixed(3) });
  setCurrentEmojiIndex((prev) => (prev + 1) % shuffledMovies.length);
  setUserGuess("");
  setChoices(pickChoices(currentEmojiIndex)); // Update choices for the new emoji
};

  return (
    <div className="text-color background-color" style={{ position: 'relative', textAlign: "center", height: "100dvh", overflow: 'hidden' }}>
      <div style={{ position: "relative" }}>
        {gameOver ? (
          <button onClick={() => window.location.reload()} className="beacon animated-button">
            Restart
          </button>
        ) : (
          <>
          <dl style={{ textAlign: 'left', margin: 0, padding: '24px'}}>
          <dt style={{ display: 'block', fontSize: '12px', margin: 0 }}>Time Left</dt> 
          <dd style={{ fontSize: '48px', fontWeight: 'bold',margin: 0 }} >{timeLeft}s</dd>
          </dl>
          <dl style={{ position: 'absolute', top: '0px', right: '16px', textAlign: 'left', margin: 0, padding: '24px'}}>
          <dt style={{ display: 'block', fontSize: '12px', margin: 0 }}>Score</dt> 
          <dd style={{ fontSize: '48px', fontWeight: 'bold',margin: 0 }} >
         {score.toFixed(2)}
          </dd>
          </dl>
     <div style={{ marginTop: '64px', fontSize: '48px', letterSpacing: '8px' }}>
      {shuffledMovies[currentEmojiIndex].emojis}
    </div>
    <div style={{ marginTop: '48px', width: '100%', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', padding: '0 16px'}}>
      {choices.map((choice, index) => (
        <button key={index} onClick={() => handleGuessSubmit(choice.title)} style={{ 
          fontSize: '16px',
          backgroundColor: '#222',
          transition: 'box-shadow .2s ease',
          boxShadow: '-6px 10px 0px 0px hsl('+Math.random() * 360+'deg,90%,54%)',
          color: 'white',
          marginBottom: '20px', 
          padding: '12px', 
          appearance: 'none', 
          WebkitAppearance: 'none', 
          border: '1px solid rgba(0,0,0,.1)' ,
          display: 'block',
          width: '100%',
          lineHeight: 1.25,
        }}>
          {choice.title}
        </button>
      ))}
    </div>
          </>
        )}
      </div>
    {pointsAnimation !== null && (
  <div className="points-animation">
    +{pointsAnimation.toFixed(2)} points
              <div>
                <p>Accuracy: {lastGuessResult.accuracy}%</p>
                <p>Time Taken: {lastGuessResult.time}ms</p>
              </div>
  </div>
)}
      {gameOver && (
        <div id="game-over-modal" style={{ textTransform: 'uppercase', position: "absolute", top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%", background: "black", color: "yellow", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: 'hidden' }}>
          <div style={{ textAlign: "center", paddingTop: '16px', height: '100%' }}>
            <p style={{ color: "red", fontSize: "16px", fontWeight: "400", margin: '0 0 16px 0' }}>
              GAME OVER
            </p>
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ background: 'white', color: 'black', padding: '8px 24px', width: 'auto', maxWidth: '640px', transform: 'rotate(-4deg)', marginBottom: '16px' }}>
                <div>
                  {!isNewHighScore && <p style={{ fontSize: '10px', margin: '0 0 2px 0', }}>SCORE</p>}
                  {isNewHighScore && (
                    <p style={{ display: 'flex', alignItems: 'center', fontSize: '10px', margin: '0 0 2px 0', textAlign: 'center', justifyContent: 'center' }}>NEW HIGH SCORE!</p>
                  )}
                  <p style={{ fontWeight: "bold", fontSize: "64px", margin: '8px 0 0 0', lineHeight: 0.9, }}>
                    {score.toFixed(2)}
                  </p>
                </div>
              </div>
              {username ? (
                <p></p>
              ) : (
                <div style={{ maxWidth: '100%' }}>
                  <form onSubmit={handleUsernameSubmit} style={{ padding: '0 0px', marginTop: '16px', marginBottom: '16px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', width: '90%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <label style={{ alignSelf: 'center', fontSize: '10px', display: 'block', alignItems: 'center', maxWidth: '192px', maxWidth: '100%', }}>
                      <span style={{ display: 'block', marginBottom: '4px', }}>Enter Username</span>
                    <input autoComplete='off' type="text" name="username" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ textTransform: 'uppercase', maxWidth: '100%', width: '12ch', borderRadius: 0, fontSize: '24px', border: '1px solid currentColor', background: 'transparent', color: 'inherit', fontWeight: 900, padding: '8px', }} />
                    </label>
                    <button type="submit" style={{ appearance: 'none', WebkitAppearance: 'none', fontWeight: 900, background: 'yellow', color: 'black', padding: '8px 12px', border: 0, height: '46px', fontSize: '12px', border: 0 }}>Submit</button>
                  </form>
                </div>
              )}
              <div style={{ width: '48%', padding: "4px 0px 4px 4px", margin: '48px 16px 0 16px', maxWidth: '256px', outline: '1px solid transparent', alignSelf: 'center', color: 'limegreen', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '14px', }}>Play Again?</p>
                <button style={{ appearance: 'none', WebkitAppearance: 'none', display: "inline-block", marginLeft: 'auto', marginRight: "0px", background: 'limegreen', color: 'black', border: 0, }} onClick={() => window.location.reload()}>
                  Yes
                </button>
                <button style={{ appearance: 'none', WebkitAppearance: 'none', border: 0, boxShadow: '0 0 0 1px transparent', background: 'transparent', color: 'limegreen', padding: '0 16px' }} >No</button>
              </div>
            </div>
          </div>
          <section style={{ marginBottom: '8px' }}>
            <div style={{ maxWidth: '512px', margin: '0 auto 20px auto', color: 'gold', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 16px' }}>
              <article>
                <h5 style={{ margin: 0, fontSize: '12px', background: 'gold', color: 'black' }}>Today</h5>
                {dailyScores.length > 0 &&
                  <ol style={{ fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1., lineHeight: 1.55, overflow: 'scroll', maxHeight: '100%' }}>
                    {dailyScores.slice(0, 10).map((score, index) => (
                      <li key={index} style={{ margin: 0, fontSize: '10px', width: '100%', padding: '2px 0', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <b style={{ display: 'inline-block', marginRight: '4px' }}>
                          <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: .5 }}>{index + 1}</span>
                          {score.user}
                        </b>
                        <code>{Number(score.score).toFixed(3)}</code>
                      </li>
                    ))}
                  </ol>
                }
              </article>
              <article style={{ color: 'gold' }}>
                <h5 style={{ margin: 0, fontSize: '12px', background: 'gold', color: 'black' }}>All-time</h5>
                <ol style={{ fontSize: '12px', padding: 0, margin: '16px 0 0 0', lineHeight: 1., lineHeight: 1.55, overflow: 'scroll', maxHeight: '100%' }}>
                  {allTimeScores.slice(0, 10).map((score, index) => (
                    <li key={index} style={{ fontSize: '10px', padding: '2px 0', borderBottom: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
                      <b style={{ display: 'inline-block', marginRight: '4px' }}>
                        <span style={{ width: '16px', display: 'inline-block', marginRight: '4px', textAlign: 'left', opacity: .5 }}>{index + 1}</span>
                        {score.user}
                      </b>
                      <code>{Number(score.score).toFixed(3)}</code>
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
