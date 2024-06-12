import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game0001 from './pages/0001';
import GameOver from './pages/GameOver';
import Home from './pages/Index'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game-over" element={<GameOver />} />
        <Route path="/0001" element={<Game0001 />} />
      </Routes>
    </Router>
  );
}

export default App;
