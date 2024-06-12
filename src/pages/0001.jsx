import React, { useEffect, useRef, useState } from 'react';

const GameComponent = () => {
  const canvasRef = useRef(null);
  const player = useRef({
    x: 100,
    y: 200,
    velocityY: 0,
    onGround: true
  });
  const dots = useRef([]);
  const gravity = 50;
  const jumpHeight = -150;
  const dotSpawnRate = 50;
  let lastDotSpawn = 0;
  const score = useRef(0);
  const [time, setTime] = useState(0);
  const [showTimeBonus, setShowTimeBonus] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [highScore, setHighScore] = useState(() => {
    // Retrieve the high score from local storage or set it to 0
    return localStorage.getItem('highScore') || 0;
  });
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });
  

    const durableObjectName = 'COUNTER_COLORMATCH'; 
    const fetchCount = async () => {
        try {
            const response = await fetch(`https://ts-gen-count.adam-f8f.workers.dev/?name=${durableObjectName}`);
            const data = await response.text();
            setCount(data);
        } catch (error) {
            console.error('Error fetching count:', error);
        }
    };

    const handleIncrement = async () => {
        try {
            await fetch(`https://ts-gen-count.adam-f8f.workers.dev/increment?name=${durableObjectName}`, {
                method: 'POST',
            });
            fetchCount(); // Update count after increment
        } catch (error) {
            console.error('Error incrementing count:', error);
        }
    };

  //const submitScore = async (scoreData, category) => {
  // const dataWithCategory = { 
  //    ...scoreData, 
  //    category,
  //  };
  //
  //  try {
  //    const response = await fetch('https://colormatch.adam-f8f.workers.dev/submit-score', {
  //      method: 'POST',
  //      headers: {
  //        'Content-Type': 'application/json',
  //      },
  //      body: JSON.stringify(dataWithCategory),
  //    });
  //
  //    if (!response.ok) {
  //      throw new Error(`HTTP error! status: ${response.status}`);
  //    }
  //
  //    console.log("Score submitted successfully");
  //  } catch (error) {
  //    console.error("Failed to submit score:", error);
  //  }
  //};

//const fetchScores = async (category) => {
//  // The category should be either 'daily' or 'all-time'
//  const url = `https://colormatch.adam-f8f.workers.dev/get-scores?category=${category}`;
//
//  try {
//    const response = await fetch(url);
//    if (!response.ok) {
//      throw new Error(`HTTP error! status: ${response.status}`);
//    }
//    const scores = await response.json();
//    return scores;
//  } catch (error) {
//    console.error("Failed to fetch scores:", error);
//    return [];
//  }
//};

//  useEffect(() => {
//    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
//    fetchCount();
//  }, [gameHistory]);

//useEffect(() => {
//  const loadScores = async () => {
//    const fetchedDailyScores = await fetchScores('daily');
//    const fetchedAllTimeScores = await fetchScores('all-time');
//    setDailyScores(fetchedDailyScores);
//    setAllTimeScores(fetchedAllTimeScores);
//  };
//
//  loadScores();
//}, []);




  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.current.y = canvas.height - 50;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000); // Update time every second

    let lastTime = 0;
    let timeBonusInterval = 8000;
    let lastTimeBonus = 0;

    const gameLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (timestamp - lastTimeBonus > timeBonusInterval) {
        score.current += 100;
        lastTimeBonus = timestamp;
        setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 2000);
      }

      if (timestamp - lastDotSpawn > dotSpawnRate) {
        spawnDot(canvas.width);
        lastDotSpawn = timestamp;
      }

      updateDots();
      updatePlayer(deltaTime);
      render(ctx, canvas);

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const spawnDot = (width) => {
    const minHeight = canvasRef.current.height - 360;
    const maxHeight = canvasRef.current.height - 24;
    const dot = {
      x: width,
      y: Math.random() * (maxHeight - minHeight) + minHeight,
      speed: 0.1 + Math.random() * 3,
      dangerous: Math.random() > 0.99
    };
    dots.current.push(dot);
  };

  const updateDots = () => {
    dots.current.forEach(dot => {
      dot.x -= dot.speed;
      if (Math.abs(dot.x - player.current.x) < 20 && Math.abs(dot.y - player.current.y) < 20) {
        if (dot.dangerous) {
          handleIncrement()
          window.location.href = '/game-over'
        } else {
          score.current += 10;
          dot.collected = true;
        }
      }
    });
    dots.current = dots.current.filter(dot => dot.x > -10 && !dot.collected);
  };

  const updatePlayer = (deltaTime) => {
    if (!player.current.onGround) {
      player.current.velocityY += gravity * (deltaTime / 1000);
    }
    player.current.y += player.current.velocityY * (deltaTime / 1000);

    if (player.current.y >= canvasRef.current.height - 50) {
      player.current.y = canvasRef.current.height - 50;
      player.current.velocityY = 0;
      player.current.onGround = true;
    }
  };

  const render = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.current.x, player.current.y, 20, 20);
    dots.current.forEach(dot => {
      ctx.fillStyle = dot.dangerous ? 'red' : 'white';
      ctx.fillRect(dot.x, dot.y, 10, 10);
    });

    ctx.font = '32px monospace';
    ctx.fillText(`Score: ${score.current}`, 32, 96);

    if (showTimeBonus) {
      ctx.fillStyle = 'yellow';
      ctx.fillText('Time Bonus! +100', canvas.width / 2 - 80, 50);
    }
  };

  const handleKeyDown = (event) => {
    if (event.code === "Space" && player.current.onGround) {
      player.current.velocityY = jumpHeight;
      player.current.onGround = false;
    }
  };

  const handleTouchStart = () => {
    if (player.current.onGround) {
      player.current.velocityY = jumpHeight;
      player.current.onGround = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('touchstart', handleTouchStart);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', background: 'black' }} />;
};

export default GameComponent;
