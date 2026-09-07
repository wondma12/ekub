import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Wheel, 
  WheelStatus, 
  WinnerDisplay, 
  WinnerHistory
} from '../../components/wheel';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { drawService } from '../../services/drawService';
import { sortUniqueNumbers } from '../../utils/helpers';

const DrawManagement = () => {
  const { drawId } = useParams();
  const navigate = useNavigate();
  const [draw, setDraw] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [wheelWinners, setWheelWinners] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [winners, setWinners] = useState([]);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (drawId) {
      fetchDrawStatus();
    }
  }, [drawId]);

  const fetchDrawStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await drawService.getDrawStatus(drawId);
      const drawWinners = data.winners || [];

      setDraw(data.draw);
      setStatus(data.draw.status);
      setLuckyNumbers(data.luckyNumbers || []);
      setResults(drawWinners);
      setWinners(drawWinners.map(w => w.number));
      setWheelWinners(drawWinners.map(w => w.number));

      const wheelNumbers = sortUniqueNumbers(
        (data.draw.numbers || []).map(drawNumber => drawNumber.number)
      );
      setTotalParticipants(wheelNumbers.length);
      setNumbers(wheelNumbers);

    } catch (err) {
      setError(err.message || 'Failed to fetch draw status');
    } finally {
      setLoading(false);
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
    try {
      await drawService.startDraw(drawId);
      await fetchDrawStatus();
    } catch (err) {
      setError(err.message || 'Failed to start draw');
    }
  };

  const handleResetDraw = async () => {
    const confirmed = window.confirm(
      'Reset this draw? All selected winners and draw progress will be cleared.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      await drawService.resetDraw(drawId);
      await fetchDrawStatus();
    } catch (err) {
      setError(err.message || 'Failed to reset draw');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {draw?.title || `Draw #${draw?.draw_number}`}
          </h1>
          <p className="text-sm text-gray-500">
            {draw?.ekub?.name || 'Ekub'} • Created {new Date(draw?.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline-danger"
            onClick={handleResetDraw}
            loading={isResetting}
            disabled={isSpinning || isResetting}
          >
            Reset Draw
          </Button>
          {(status === 'READY' || (status === 'DRAFT' && !(draw?.lucky_user_ids || []).length)) && (
            <Button
              variant="success"
              onClick={handleStartDraw}
              disabled={isResetting}
            >
              🚀 ማሽከርከር ጀምር
            </Button>
          )}
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/draws')}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wheel Section */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            <Wheel
              numbers={numbers}
              winners={wheelWinners}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              disabled={status !== 'IN_PROGRESS'}
              onSpin={handleSpin}
              size={500}
            />
            <div className="mt-4 flex items-center gap-4">
              {currentWinner && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-2xl font-bold text-green-600">
                    🎉 {currentWinner.number}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {winners.length} of {totalParticipants} draw numbers selected
            </p>
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

          <WinnerHistory
            results={results}
            maxDisplay={10}
          />
        </div>
      </div>

    </div>
  );
};

export default DrawManagement;