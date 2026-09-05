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
import Modal from '../../components/common/Modal';
import { drawService } from '../../services/drawService';

const DrawManagement = () => {
  const { drawId } = useParams();
  const navigate = useNavigate();
  const [draw, setDraw] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [wheelWinners, setWheelWinners] = useState([]);
  const [wheelLuckyNumbers, setWheelLuckyNumbers] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [winners, setWinners] = useState([]);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [status, setStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  const [selectedLucky, setSelectedLucky] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (drawId) {
      fetchDrawStatus();
    }
  }, [drawId]);

  useEffect(() => {
    if (drawId && showLuckyModal) {
      fetchAvailableUsers();
    }
  }, [drawId, showLuckyModal]);

  const fetchAvailableUsers = async () => {
    try {
      const users = await drawService.getAvailableUsers(drawId);
      setAvailableUsers(users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    }
  };

  const fetchDrawStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await drawService.getDrawStatus(drawId);
      const drawWinners = data.winners || [];

      setDraw(data.draw);
      setStatus(data.draw.status);
      const luckyUserIds = (data.luckyUserIds || data.draw?.lucky_user_ids || []).map(id => Number(id));
      setLuckyNumbers(data.luckyNumbers || []);
      setWheelLuckyNumbers(luckyUserIds.map((_, index) => index + 1));
      setSelectedLucky(luckyUserIds);
      setResults(drawWinners);
      setWinners(drawWinners.map(w => w.number));
      setWheelWinners(drawWinners.map(w => w.position));

      setTotalParticipants(data.totalUsers || 0);
      setNumbers(Array.from(
        { length: data.totalUsers || 0 },
        (_, index) => index + 1
      ).filter(slot => !drawWinners.some(winner => winner.position === slot)));

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

      setTimeout(() => {
        setCurrentWinner(null);
        setIsSpinning(false);
        fetchDrawStatus();
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to spin wheel');
      setIsSpinning(false);
    }
  };

  const handleSetLuckyNumbers = async () => {
    try {
      await drawService.setLuckyNumbers(drawId, selectedLucky);
      setShowLuckyModal(false);
      setSelectedLucky([]);
      await fetchDrawStatus();
    } catch (err) {
      setError(err.message || 'Failed to set lucky numbers');
    }
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
    if (!window.confirm('Are you sure you want to reset this draw? All progress will be lost.')) return;
    
    try {
      await drawService.resetDraw(drawId);
      await fetchDrawStatus();
      setWinners([]);
      setResults([]);
      setCurrentWinner(null);
    } catch (err) {
      setError(err.message || 'Failed to reset draw');
    }
  };

  const toggleLuckyUser = (userId) => {
    const numericId = Number(userId);
    if (!selectedLucky.includes(numericId) && selectedLucky.length >= 7) {
      return;
    }

    setSelectedLucky(prev =>
      prev.includes(numericId)
        ? prev.filter(id => id !== numericId)
        : [...prev, numericId]
    );
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
          {status === 'DRAFT' && (
            <Button
              variant="warning"
              onClick={() => {
                setSelectedLucky((draw?.lucky_user_ids || []).map(id => Number(id)));
                setShowLuckyModal(true);
              }}
            >
              ⭐ Set Lucky Users
            </Button>
          )}
          {status === 'READY' && (
            <Button
              variant="success"
              onClick={handleStartDraw}
            >
              🚀 Start Draw
            </Button>
          )}
          {(status === 'IN_PROGRESS' || status === 'READY' || status === 'DRAFT') && (
            <Button
              variant="outline-danger"
              onClick={handleResetDraw}
            >
              Reset
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
              luckyNumbers={wheelLuckyNumbers}
              onSpinComplete={(winner) => {
                // Winner is already handled in handleSpin
              }}
              isSpinning={isSpinning}
              disabled={status !== 'IN_PROGRESS'}
              onSpin={handleSpin}
              size={500}
            />
            <div className="mt-4 flex items-center gap-4">
              <SpinButton
                onClick={handleSpin}
                disabled={status !== 'IN_PROGRESS' || isSpinning}
                isSpinning={isSpinning}
                label={status === 'IN_PROGRESS' ? 'SPIN' : 'Draw Not Started'}
              />
              {currentWinner && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-2xl font-bold text-green-600">
                    🎉 {currentWinner.full_name || `User ${currentWinner.number}`}
                  </span>
                  {currentWinner.id && (
                    <span className="block text-xs text-green-600">User ID: {currentWinner.id}</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {winners.length} of {totalParticipants} users selected
            </p>
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
        </div>
      </div>

      {/* Lucky Numbers Modal */}
      <Modal
        isOpen={showLuckyModal}
        onClose={() => setShowLuckyModal(false)}
        title="⭐ Select Lucky Users"
        size="lg"
        actions={
          <>
            <Button
              variant="light"
              onClick={() => setShowLuckyModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSetLuckyNumbers}
              disabled={selectedLucky.length === 0}
            >
              Set {selectedLucky.length} Lucky Users
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select up to 7 active registered users. These lucky users will be picked first in the draw.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {availableUsers.map((user) => {
              const userId = Number(user.id);
              const isSelected = selectedLucky.includes(userId);
              const isLucky = luckyNumbers.includes(userId);

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleLuckyUser(user.id)}
                  disabled={isLucky && !isSelected}
                  className={`
                    w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all duration-200
                    ${isSelected
                      ? 'border-yellow-300 bg-yellow-100 text-gray-800 shadow-sm'
                      : isLucky
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : selectedLucky.length >= 7
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                    }
                  `}
                >
                  <div>
                    <div className="font-semibold">{user.full_name}</div>
                    <div className="text-xs opacity-75">User ID: {user.id}</div>
                  </div>
                  <span className="text-lg">{isSelected ? '⭐' : ''}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            Selected: {selectedLucky.length} / 7
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default DrawManagement;