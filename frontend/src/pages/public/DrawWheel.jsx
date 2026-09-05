import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Wheel, 
  WheelStatus, 
  WinnerDisplay, 
  WinnerHistory,
  SpinButton 
} from '../../components/wheel';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { drawService } from '../../services/drawService';
import { useAuth } from '../../context/AuthContext';

const DrawWheel = () => {
  const { drawId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [draw, setDraw] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [wheelWinners, setWheelWinners] = useState([]);
  const [wheelLuckyNumbers, setWheelLuckyNumbers] = useState([]);
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
      setWheelLuckyNumbers((data.luckyUserIds || data.draw?.lucky_user_ids || []).map((_, index) => index + 1));
      setResults(drawWinners);
      
      const winnerNumbers = drawWinners.map(w => w.number);
      setWinners(winnerNumbers);
      setWheelWinners(drawWinners.map(w => w.position));

      setTotalParticipants(data.totalUsers || 0);
      setNumbers(Array.from(
        { length: data.totalUsers || 0 },
        (_, index) => index + 1
      ).filter(slot => !drawWinners.some(winner => winner.position === slot)));

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

      setCurrentWinner(data.user || { id: null, full_name: `User ${data.number}`, number: data.number });
      
      // Add to winners
      setWinners(prev => [...prev, data.number]);
      setWheelWinners(prev => [...prev, data.spinNumber]);
      setResults(prev => [...prev, {
        number: data.number,
        selection_type: data.isLucky ? 'LUCKY' : 'RANDOM',
        spin_number: data.spinNumber,
        position: prev.length + 1,
        user: data.user,
      }]);

      // Update numbers
      setNumbers(prev => prev.filter(slot => slot !== data.spinNumber));

      // Update draw status
      if (data.completed) {
        setStatus('COMPLETED');
      }

      // Clear winner display after delay
      setTimeout(() => {
        setCurrentWinner(null);
        setIsSpinning(false);
        fetchDrawStatus(false);
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to spin wheel');
      setIsSpinning(false);
    }
  };

  const handleStartDraw = async () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {draw.title || `Draw #${draw.draw_number}`}
              </h1>
              <p className="text-sm text-gray-500">
                {draw.ekub?.name || 'Ekub'} • Created {new Date(draw.created_at).toLocaleDateString()}
              </p>
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
          <span className="text-sm text-gray-500 self-center">
            🌐 Public draw mode
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wheel Section */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            <Wheel
              numbers={numbers}
              winners={wheelWinners}
              luckyNumbers={wheelLuckyNumbers}
              onSpinComplete={(winner) => {
                // Winner is already handled in handleSpin
              }}
              isSpinning={isSpinning}
              disabled={status !== 'IN_PROGRESS'}
              onSpin={handleSpin}
              size={Math.min(500, window.innerWidth - 100)}
            />
            
            <div className="mt-4 flex flex-col items-center gap-3">
              {status === 'READY' ? (
                <Button
                  variant="success"
                  onClick={handleStartDraw}
                  disabled={isSpinning}
                >
                  🚀 Start Draw
                </Button>
              ) : status === 'IN_PROGRESS' ? (
                <SpinButton
                  onClick={handleSpin}
                  disabled={isSpinning}
                  isSpinning={isSpinning}
                  label="SPIN"
                />
              ) : (
                <div className="text-sm text-gray-500">
                  {status === 'COMPLETED' ? '🎉 Draw completed!' : '⏳ Waiting for draw to be configured...'}
                </div>
              )}
              
              {currentWinner && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <p className="text-sm font-medium text-green-600">🎉 Winner!</p>
                    <p className="text-4xl font-bold text-green-700">{currentWinner.full_name || currentWinner}</p>
                    {currentWinner.id && (
                      <p className="text-sm text-green-600">User ID: {currentWinner.id}</p>
                    )}
                    <p className="text-xs text-green-500 mt-1">
                      {luckyNumbers.includes(currentWinner.number) ? '⭐ Lucky' : '🎲 Random'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>🎯 {winners.length} winners</span>
              <span>•</span>
              <span>📊 {Math.max(totalParticipants - winners.length, 0)} remaining</span>
              <span>•</span>
              <span>👥 {totalParticipants} registered users</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <WheelStatus
            status={status}
            totalParticipants={totalParticipants}
            luckyCount={luckyNumbers.length}
            winnersCount={winners.length}
            remainingCount={Math.max(totalParticipants - winners.length, 0)}
            currentSpin={winners.length}
            totalSpins={totalParticipants}
            showLuckyCount={false}
          />

          <WinnerDisplay
            winners={winners}
            currentWinner={currentWinner}
            luckyNumbers={luckyNumbers}
            totalParticipants={totalParticipants}
            results={results}
          />

          <WinnerHistory
            results={results}
            maxDisplay={10}
          />

          {/* Draw Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">📋 Draw Info</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Draw Number</span>
                <span className="font-medium">#{draw.draw_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lucky Users</span>
                <span className="font-medium">{draw?.lucky_user_ids?.length || luckyNumbers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created By</span>
                <span className="font-medium">{draw.creator?.full_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{status.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawWheel;