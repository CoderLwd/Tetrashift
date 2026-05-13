import { useState, useEffect, useCallback } from 'react';

export const useGameStats = () => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const linePoints = [40, 100, 300, 1200];

  const updateStats = useCallback((rowsCleared: number) => {
    if (rowsCleared > 0) {
      setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
    }
  }, [level]);

  return { score, setScore, rows, setRows, level, setLevel, updateStats };
};
