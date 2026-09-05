import React from 'react';

const WheelStatus = ({ 
  status, 
  totalParticipants,
  luckyCount, 
  winnersCount, 
  remainingCount,
  currentSpin,
  totalSpins,
  showLuckyCount = true,
}) => {
  const getStatusConfig = () => {
    const configs = {
      DRAFT: {
        label: 'Draft - Set Lucky Numbers',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '📝',
        progress: 0,
      },
      READY: {
        label: 'Ready to Start',
        color: 'bg-blue-100 text-blue-800',
        icon: '✅',
        progress: 0,
      },
      IN_PROGRESS: {
        label: 'In Progress',
        color: 'bg-green-100 text-green-800',
        icon: '🔄',
        progress: totalParticipants ? winnersCount / totalParticipants * 100 : 0,
      },
      COMPLETED: {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800',
        icon: '🎉',
        progress: 100,
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        icon: '❌',
        progress: 0,
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
          <span>{statusConfig.icon}</span>
          {statusConfig.label}
        </span>
        {currentSpin && totalSpins && status === 'IN_PROGRESS' && (
          <span className="text-sm text-gray-500">
            Spin {currentSpin}/{totalSpins}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 ${showLuckyCount ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3`}>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{totalParticipants || 0}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
        {showLuckyCount && (
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
            <p className="text-xl font-bold text-yellow-700">{luckyCount || 0}</p>
            <p className="text-xs text-yellow-600">⭐ Lucky Users</p>
          </div>
        )}
        <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
          <p className="text-xl font-bold text-green-700">{winnersCount || 0}</p>
          <p className="text-xs text-green-600">🏆 Winners</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{remainingCount || 0}</p>
          <p className="text-xs text-blue-600">Remaining</p>
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'IN_PROGRESS' && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{Math.round(statusConfig.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(statusConfig.progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'DRAFT' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <p className="flex items-center gap-2">
            <span>💡</span>
            Select lucky numbers and then start the draw
          </p>
        </div>
      )}

      {status === 'READY' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="flex items-center gap-2">
            <span>🚀</span>
            Ready to start! Click the spin button to begin
          </p>
        </div>
      )}

      {status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          <p className="flex items-center gap-2">
            <span>🎊</span>
            Draw completed! All participants have been selected
          </p>
        </div>
      )}

      {status === 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <p className="flex items-center gap-2">
            <span>⚠️</span>
            This draw has been cancelled
          </p>
        </div>
      )}
    </div>
  );
};

export default WheelStatus;