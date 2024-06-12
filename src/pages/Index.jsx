import React, { useEffect, useState, useRef } from 'react';
import '../App.css';

const App = () => {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [count, setCount] = useState(0);
    const [inputMethod, setInputMethod] = useState('click');
    const startTime = useRef(Date.now());
    const durableObjectName = 'WORST_GAME_HOME';

    // Function to fetch the current count
    const fetchCount = async () => {
        try {
            const response = await fetch(`https://ts-gen-count.adam-f8f.workers.dev/?name=${durableObjectName}`);
            const data = await response.text();
            setCount(data);
        } catch (error) {
            console.error('Error fetching count:', error);
        }
    };

    // Function to increment the count
    const handleIncrement = async () => {
        try {
            await fetch(`https://ts-gen-count.adam-f8f.workers.dev/increment?name=${durableObjectName}`, {
                method: 'POST',
            });
            fetchCount(); // Fetch the updated count after increment
        } catch (error) {
            console.error('Error incrementing count:', error);
        }
    };

    // Handle button click
    const handleButtonClick = () => {
        if (!gameOver) {
            const endTime = Date.now();
            const timeTaken = endTime - startTime.current;
            setScore(timeTaken);
            setGameOver(true);
            handleIncrement(); // Increment the game count
        }
    };

    // Setup timer and fetch count on component mount
    useEffect(() => {
        fetchCount();
        const timer = setInterval(() => {
            if (!gameOver) {
                const currentTime = Date.now();
                const timeTaken = currentTime - startTime.current;
                setScore(timeTaken);
            }
        }, 1); // Update the timer every millisecond

        return () => clearInterval(timer); // Cleanup the interval on component unmount
    }, [gameOver]);

  useEffect(() => {
        // Check if the device supports touch events
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
                        <p style={{ color: 'red', fontSize: '48px' }}>GAME OVER</p>
                        <p style={{ fontSize: '12px', margin: 0, lineHeight: 1 }}>SCORE</p>
                        <p style={{ fontWeight: 'bold', fontSize: '128px', margin: 0 }} >{score}</p>
                        <small style={{ fontSize: '10px' }}>This game has been played {count} times</small>
                        <p style={{marginTop: '64px' }}>Continue?</p>
                        <button style={{display: 'inline-block', marginRight: '32px' }} onClick={() => window.location.reload()}>Yes</button>
                        <button>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
