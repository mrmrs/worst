import React, { useEffect, useState, useRef } from 'react';
import '../App.css';

const App = () => {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [count, setCount] = useState(0);
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('highScore'), 10) || 0);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [inputMethod, setInputMethod] = useState('click');
    const startTime = useRef(Date.now());
    const durableObjectName = 'WORST_GAME_HOME';

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
            fetchCount();
        } catch (error) {
            console.error('Error incrementing count:', error);
        }
    };

const handleButtonClick = () => {
    if (!gameOver) {
        const endTime = Date.now();
        const timeTaken = endTime - startTime.current;
        setScore(timeTaken);
        setGameOver(true);
        handleIncrement();

        // Check if new score is higher than the high score
        if (timeTaken > highScore) {
            localStorage.setItem('highScore', timeTaken);
            setHighScore(timeTaken);
            setIsNewHighScore(true);  // Set the flag to true if it's a new high score
        } else {
            setIsNewHighScore(false);  // Reset the flag if not a high score
        }
    }
};

    useEffect(() => {
        fetchCount();
        const timer = setInterval(() => {
            if (!gameOver) {
                const currentTime = Date.now();
                const timeTaken = currentTime - startTime.current;
                setScore(timeTaken);
            }
        }, 1);
        return () => clearInterval(timer);
    }, [gameOver]);

    useEffect(() => {
        if (!username) {
            const newUser = prompt('Please enter your username:');
            if (newUser) {
                localStorage.setItem('username', newUser);
                setUsername(newUser);
            }
        }
    }, []);

    useEffect(() => {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            setInputMethod('tap');
        } else {
            setInputMethod('click');
        }
    }, []);

    return (
        <div className="text-color background-color" style={{ textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p>WORST GAMES</p>
            <button onClick={handleButtonClick} className='animated-button' style={{ marginTop: '20px' }}>
                Do not {inputMethod}
            </button>
            <p>{score}</p>
            {gameOver && (
                <div id="game-over-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'black', color: 'yellow', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'red', fontSize: '48px', fontWeight: 'bold' }}>GAME OVER</p>
                        {!isNewHighScore && <p style={{ color: 'white' }}>SCORE</p>}
                        {isNewHighScore && <p style={{ color: 'white' }}>NEW HIGH SCORE!</p>}
                        <p style={{ fontWeight: 'bold', fontSize: '96px', margin: 0 }}>{score}</p>
                        <small style={{ fontSize: '10px', color: '#777' }}>This game has been played {count} times</small>
                        <p style={{ marginTop: '64px' }}>Continue?</p>
                        <button style={{ display: 'inline-block', marginRight: '32px' }} onClick={() => window.location.reload()}>Yes</button>
                        <button>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
