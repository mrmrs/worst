import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game0001 from './pages/0001';
import Game0003 from './pages/0003';
import ClassicHome from './pages/Index';
import Game01 from './games/Game01';
import Game02 from './games/Game02';
import Game03 from './games/Game03';
import Game04 from './games/Game04';
import Game05 from './games/Game05';
import Game06 from './games/Game06';
import Game07 from './games/Game07';
import Game08 from './games/Game08';
import Game09 from './games/Game09';
import Game10 from './games/Game10';
import Game11 from './games/Game11';
import Game12 from './games/Game12';
import Game13 from './games/Game13';
import Game14 from './games/Game14';
import Game15 from './games/Game15';
import Game16 from './games/Game16';
import Game17 from './games/Game17';
import Game18 from './games/Game18';
import Game19 from './games/Game19';
import Game20 from './games/Game20';
import Game21 from './games/Game21';
import Game22 from './games/Game22';
import Game23 from './games/Game23';
import Game24 from './games/Game24';
import Game25 from './games/Game25';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/0000" element={<ClassicHome />} />
        <Route path="/0001" element={<Game0001 />} />
        <Route path="/0003" element={<Game0003 />} />
        <Route path="/01" element={<Game01 />} />
        <Route path="/02" element={<Game02 />} />
        <Route path="/03" element={<Game03 />} />
        <Route path="/04" element={<Game04 />} />
        <Route path="/05" element={<Game05 />} />
        <Route path="/06" element={<Game06 />} />
        <Route path="/07" element={<Game07 />} />
        <Route path="/08" element={<Game08 />} />
        <Route path="/09" element={<Game09 />} />
        <Route path="/10" element={<Game10 />} />
        <Route path="/11" element={<Game11 />} />
        <Route path="/12" element={<Game12 />} />
        <Route path="/13" element={<Game13 />} />
        <Route path="/14" element={<Game14 />} />
        <Route path="/15" element={<Game15 />} />
        <Route path="/16" element={<Game16 />} />
        <Route path="/17" element={<Game17 />} />
        <Route path="/18" element={<Game18 />} />
        <Route path="/19" element={<Game19 />} />
        <Route path="/20" element={<Game20 />} />
        <Route path="/21" element={<Game21 />} />
        <Route path="/22" element={<Game22 />} />
        <Route path="/23" element={<Game23 />} />
        <Route path="/24" element={<Game24 />} />
        <Route path="/25" element={<Game25 />} />
      </Routes>
    </Router>
  );
}

export default App;
