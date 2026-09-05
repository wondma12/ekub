import { useState, useEffect, useCallback } from 'react';
import { drawService } from '../services';

export const useDraw = (drawId) => {
  const [draw, setDraw] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [winners, setWinners] = useState([]);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);

  // Fetch draw status
  const fetchDrawStatus = useCallback(async () => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await drawService.getDrawStatus(drawId);

      setDraw(data.draw);
      setStatus(data.draw.status);
      setLuckyNumbers(data.luckyNumbers || []);
      setResults(data.winners || []);
      
      const winnerNumbers = data.winners.map(w => w.number);
      setWinners(winnerNumbers);

      // Get available numbers
      const availableNumbers = data.draw.numbers
        .filter(n => n.status === 'ELIGIBLE' || n.status === 'LUCKY')
        .map(n => n.number);
      setNumbers(availableNumbers);
      
      setTotalParticipants(data.totalEligible || (availableNumbers.length + winnerNumbers.length));

      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch draw status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  // Create a new draw
  const createDraw = useCallback(async (drawData) => {
    try {
      setLoading(true);
      setError(null);
      const newDraw = await drawService.createDraw(drawData);
      return newDraw;
    } catch (err) {
      setError(err.message || 'Failed to create draw');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set lucky numbers
  const setLuckyNumbers = useCallback(async (numbers) => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedDraw = await drawService.setLuckyNumbers(drawId, numbers);
      await fetchDrawStatus();
      return updatedDraw;
    } catch (err) {
      setError(err.message || 'Failed to set lucky numbers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId, fetchDrawStatus]);

  // Start the draw
  const startDraw = useCallback(async () => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedDraw = await drawService.startDraw(drawId);
      await fetchDrawStatus();
      return updatedDraw;
    } catch (err) {
      setError(err.message || 'Failed to start draw');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId, fetchDrawStatus]);

  // Spin the wheel
  const spin = useCallback(async () => {
    if (!drawId) return;

    try {
      setIsSpinning(true);
      setCurrentWinner(null);
      setError(null);

      const data = await drawService.spin(drawId);

      if (data.completed) {
        setStatus('COMPLETED');
        await fetchDrawStatus();
        return { completed: true };
      }

      setCurrentWinner(data.number);
      
      // Add to winners
      setWinners(prev => [...prev, data.number]);
      setResults(prev => [...prev, {
        number: data.number,
        selection_type: data.isLucky ? 'LUCKY' : 'RANDOM',
        spin_number: data.spinNumber,
        position: prev.length + 1,
      }]);

      // Update numbers
      setNumbers(prev => prev.filter(n => n !== data.number));

      // Update draw status
      if (data.completed) {
        setStatus('COMPLETED');
      }

      // Clear winner after delay
      setTimeout(() => {
        setCurrentWinner(null);
      }, 3000);

      await fetchDrawStatus();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to spin wheel');
      throw err;
    } finally {
      setIsSpinning(false);
    }
  }, [drawId, fetchDrawStatus]);

  // Cancel the draw
  const cancelDraw = useCallback(async () => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedDraw = await drawService.cancelDraw(drawId);
      await fetchDrawStatus();
      return updatedDraw;
    } catch (err) {
      setError(err.message || 'Failed to cancel draw');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId, fetchDrawStatus]);

  // Reset the draw
  const resetDraw = useCallback(async () => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedDraw = await drawService.resetDraw(drawId);
      await fetchDrawStatus();
      setWinners([]);
      setResults([]);
      setCurrentWinner(null);
      return updatedDraw;
    } catch (err) {
      setError(err.message || 'Failed to reset draw');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId, fetchDrawStatus]);

  // Get draw results
  const getResults = useCallback(async () => {
    if (!drawId) return;

    try {
      setLoading(true);
      setError(null);
      const resultsData = await drawService.getDrawResults(drawId);
      return resultsData;
    } catch (err) {
      setError(err.message || 'Failed to get draw results');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [drawId]);

  // Auto-refresh for active draws
  useEffect(() => {
    let interval;

    if (drawId && (status === 'IN_PROGRESS')) {
      interval = setInterval(() => {
        fetchDrawStatus();
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [drawId, status, fetchDrawStatus]);

  // Initial fetch
  useEffect(() => {
    if (drawId) {
      fetchDrawStatus();
    }
  }, [drawId, fetchDrawStatus]);

  return {
    // State
    draw,
    numbers,
    winners,
    luckyNumbers,
    results,
    status,
    loading,
    error,
    isSpinning,
    currentWinner,
    totalParticipants,
    
    // Actions
    fetchDrawStatus,
    createDraw,
    setLuckyNumbers,
    startDraw,
    spin,
    cancelDraw,
    resetDraw,
    getResults,
    
    // Helpers
    isReady: status === 'READY',
    isInProgress: status === 'IN_PROGRESS',
    isCompleted: status === 'COMPLETED',
    isDraft: status === 'DRAFT',
    isCancelled: status === 'CANCELLED',
    remainingCount: numbers.length,
    winnersCount: winners.length,
    totalCount: totalParticipants,
  };
};

export default useDraw;