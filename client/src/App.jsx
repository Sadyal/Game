import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  );
};

export default App;
