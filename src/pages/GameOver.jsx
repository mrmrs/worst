import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'

function Page() {
  const navigate = useNavigate();
  const gamePages = [ '0001']; // Add new game page numbers here as you create them

  const handleContinue = () => {
    const randomGame = gamePages[Math.floor(Math.random() * gamePages.length)];
    navigate(`/${randomGame}`);
  };

  return (
    <div className='background-color-alt text-color-alt' style={{ textAlign: 'center', height: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="800" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
        <text fill="tomato" stroke="white" strokeWidth="2" x="50%" y="50%" dy=".35em" textAnchor="middle" fontSize="50" fontFamily="'Press Start 2P', monospace">
          GAME OVER
        </text>
      </svg>
      <p>Continue?</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={handleContinue} style={{ padding: '8px 24px', border: 0 }}>
          Yes
        </button>
        <button className='text-color-alt' onClick={() => navigate('/')} style={{ padding: '8px 24px', backgroundColor: 'transparent', borderColor: 'currentColor', borderWidth: '1px', borderStyle: 'solid' }}>
          No
        </button>
      </div>
    </div>
  );
}

export default Page;
