import React from 'react';

const WinnerDisplay = ({ winners, currentWinner, totalParticipants, results = [] }) => {
  return (
    <div className="space-y-4">
      {/* Current Winner */}
      {currentWinner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <p className="text-sm font-medium text-green-600">የአሁን ውጤት</p>
            <p className="text-3xl font-bold text-green-700 mt-1">
              {currentWinner?.number ?? currentWinner}
            </p>
          </div>
        </div>
      )}

      {/* Winners List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">
            🏆 የወጡ ቁጥሮች ({winners.length})
          </h4>
          {totalParticipants && (
            <span className="text-sm text-gray-500">
              {totalParticipants - winners.length} remaining
            </span>
          )}
        </div>
        <div className="p-4 max-h-60 overflow-y-auto">
          {winners.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              No winners yet. Start the draw!
            </p>
          ) : (
            <div className="space-y-2">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-xs text-gray-400 font-medium">
                    Spin {index + 1}:
                  </span>
                  <span className="font-bold text-gray-700">
                    {winner}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;