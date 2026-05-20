import { useState, useEffect, useRef, useCallback } from 'react';

function padGameId(gameId) {
  return String(gameId).padStart(4, '0');
}

export function useLeaderboard(gameId) {
  const enabled = Boolean(gameId);
  const gameNum = enabled ? padGameId(gameId) : '0000';
  const scoreApi = `https://games-${gameNum}.adam-f8f.workers.dev`;
  const countName = `WORST_GAME_${gameNum}`;
  const highScoreKey = `highScore_${gameNum}`;

  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [count, setCount] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(highScoreKey), 10) || 0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const submittedRef = useRef(false);
  const pendingScoreRef = useRef(null);

  const fetchScores = useCallback(async (category) => {
    try {
      const response = await fetch(`${scoreApi}/get-scores?category=${category}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      return [];
    }
  }, [scoreApi]);

  const submitScore = useCallback(async (scoreData, category = 'daily') => {
    try {
      const response = await fetch(`${scoreApi}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, category }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const [daily, allTime] = await Promise.all([fetchScores('daily'), fetchScores('all-time')]);
      setDailyScores(daily);
      setAllTimeScores(allTime);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [scoreApi, fetchScores]);

  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch(`https://ts-gen-count.adam-f8f.workers.dev/?name=${countName}`);
      setCount(await response.text());
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  }, [countName]);

  const incrementCount = useCallback(async () => {
    try {
      await fetch(`https://ts-gen-count.adam-f8f.workers.dev/increment?name=${countName}`, { method: 'POST' });
      fetchCount();
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  }, [countName, fetchCount]);

  useEffect(() => {
    if (!enabled) return;
    const load = async () => {
      const [daily, allTime] = await Promise.all([fetchScores('daily'), fetchScores('all-time')]);
      setDailyScores(daily);
      setAllTimeScores(allTime);
    };
    load();
    fetchCount();
  }, [enabled, fetchScores, fetchCount]);

  const onGameEnd = useCallback((score) => {
    if (!enabled || submittedRef.current) return;
    submittedRef.current = true;

    const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;
    pendingScoreRef.current = numericScore;

    incrementCount();

    if (numericScore > highScore) {
      localStorage.setItem(highScoreKey, String(Math.floor(numericScore)));
      setHighScore(Math.floor(numericScore));
      setIsNewHighScore(true);
    } else {
      setIsNewHighScore(false);
    }

    if (username) {
      submitScore({ user: username, score: numericScore, timeTaken: numericScore });
    } else {
      setShowUsernameForm(true);
    }
  }, [enabled, username, highScore, highScoreKey, incrementCount, submitScore]);

  const resetSession = useCallback(() => {
    submittedRef.current = false;
    pendingScoreRef.current = null;
    setShowUsernameForm(false);
    setIsNewHighScore(false);
  }, []);

  const handleUsernameSubmit = useCallback((e) => {
    e.preventDefault();
    const newUsername = (usernameInput || e.target.username?.value || '').trim();
    if (!newUsername) return;
    localStorage.setItem('username', newUsername);
    setUsername(newUsername);
    setShowUsernameForm(false);
    const s = pendingScoreRef.current ?? 0;
    submitScore({ user: newUsername, score: s, timeTaken: s });
  }, [usernameInput, submitScore]);

  return {
    username,
    usernameInput,
    setUsernameInput,
    dailyScores,
    allTimeScores,
    count,
    highScore,
    isNewHighScore,
    showUsernameForm,
    onGameEnd,
    resetSession,
    handleUsernameSubmit,
  };
}
