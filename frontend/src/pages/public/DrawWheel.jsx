import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Wheel, 
  WheelStatus, 
  WinnerDisplay
} from '../../components/wheel';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { drawService } from '../../services/drawService';
import { useAuth } from '../../context/AuthContext';
import { sortUniqueNumbers } from '../../utils/helpers';

const DrawWheel = () => {
  const { drawId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [draw, setDraw] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [wheelWinners, setWheelWinners] = useState([]);
  const [winners, setWinners] = useState([]);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'JUDGE';
  const isDrawActive = draw?.is_active !== false;

  useEffect(() => {
    if (drawId) {
      fetchDrawStatus(true);
      
      // Keep active draws updated without replacing the visible page with a loader.
      const interval = setInterval(() => {
        if (status === 'IN_PROGRESS') {
          fetchDrawStatus(false);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [drawId, status]);

  const fetchDrawStatus = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);
      const data = await drawService.getDrawStatus(drawId);
      const drawWinners = data.winners || [];

      setDraw(data.draw);
      setStatus(data.draw.status);
      setLuckyNumbers(data.luckyNumbers || []);
      setResults(drawWinners);
      
      const winnerNumbers = drawWinners.map(w => w.number);
      setWinners(winnerNumbers);
      setWheelWinners(drawWinners.map(w => w.number));

      const wheelNumbers = sortUniqueNumbers(
        (data.draw.numbers || []).map(drawNumber => drawNumber.number)
      );
      setTotalParticipants(wheelNumbers.length);
      setNumbers(wheelNumbers);

      // Check if draw is complete
      if (data.isComplete && status !== 'COMPLETED') {
        setStatus('COMPLETED');
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch draw status');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleSpin = async () => {
    if (!isDrawActive) {
      setError('This draw is deactivated and cannot spin');
      return;
    }
    if (status !== 'IN_PROGRESS') {
      setError('Start the draw before spinning');
      return;
    }

    try {
      setIsSpinning(true);
      setCurrentWinner(null);

      const data = await drawService.spin(drawId);

      if (data.completed) {
        setStatus('COMPLETED');
        await fetchDrawStatus();
        setIsSpinning(false);
        return;
      }

      return data;

    } catch (err) {
      setError(err.message || 'Failed to spin wheel');
      setIsSpinning(false);
    }
  };

  const handleSpinComplete = (number, data) => {
    setCurrentWinner({ number });
    setWinners(prev => [...prev, number]);
    setWheelWinners(prev => [...prev, number]);
    setResults(prev => [...prev, {
      number,
      selection_type: data.isLucky ? 'LUCKY' : 'RANDOM',
      spin_number: data.spinNumber,
      position: prev.length + 1,
      user: data.user,
    }]);
    setIsSpinning(false);
  };

  const handleStartDraw = async () => {
    if (!isDrawActive) {
      setError('This draw is deactivated and cannot start');
      return;
    }
    try {
      setError(null);
      await drawService.startDraw(drawId);
      await fetchDrawStatus();
    } catch (err) {
      setError(err.message || 'Failed to start draw');
    }
  };

  const handleBack = () => {
    navigate('/draws');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading draw..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline-secondary" onClick={handleBack}>
          ← Back to Draws
        </Button>
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🔍</span>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Draw not found</h3>
        <p className="text-gray-500 text-sm">The draw you're looking for doesn't exist</p>
        <Button variant="primary" onClick={handleBack} className="mt-4">
          Back to Draws
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 p-6 space-y-6 bg-[#101820] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-[#263746] transition-colors"
            >
              <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {draw.title || `Draw #${draw.draw_number}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && status === 'COMPLETED' && (
            <Button
              variant="outline-secondary"
              onClick={fetchDrawStatus}
            >
              🔄 Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wheel Section */}
        <div className="lg:col-span-3 bg-[#101820] rounded-xl shadow-2xl border border-[#263746] p-6">
          <div className="flex flex-col items-center">
            <Wheel
              numbers={numbers}
              winners={wheelWinners}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              disabled={!isDrawActive || status !== 'IN_PROGRESS'}
              onSpin={handleSpin}
              size={Math.min(500, window.innerWidth - 100)}
            />
            
            <div className="mt-4 flex flex-col items-center gap-3">
              {!isDrawActive ? (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <span aria-hidden="true">⛔</span> Draw deactivated: spinning is disabled
                </div>
              ) : status === 'READY' ? (
                <Button
                  variant="success"
                  onClick={handleStartDraw}
                  disabled={isSpinning}
                >
                  🚀 Start Draw
                </Button>
              ) : status === 'IN_PROGRESS' ? (
                <span className="text-sm text-gray-500">Use the wheel to spin</span>
              ) : (
                <div className="text-sm text-gray-500">
                  {status === 'COMPLETED' ? '🎉 Draw completed!' : '⏳ Waiting for draw to be configured...'}
                </div>
              )}
              
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <WheelStatus
            status={status}
            totalParticipants={totalParticipants}
            luckyCount={0}
            winnersCount={winners.length}
            remainingCount={Math.max(totalParticipants - winners.length, 0)}
            currentSpin={winners.length}
            totalSpins={totalParticipants}
            showLuckyCount={false}
          />

          <WinnerDisplay
            winners={winners}
            currentWinner={currentWinner}
            totalParticipants={totalParticipants}
            results={results}
          />

        </div>
      </div>
    </div>
  );
};

export default DrawWheel;