import React from 'react';

const WinnerDisplay = ({ winners, currentWinner, totalParticipants, results = [] }) => {
  return (
    <div className="space-y-4">
      {/* Current Winner */}
      {currentWinner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">🎉 Current Winner</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {currentWinner?.full_name || currentWinner}
              </p>
              {currentWinner?.id && (
                <p className="text-sm text-green-600">User ID: {currentWinner.id}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">Selected</p>
              <p className="text-xs text-green-500 mt-1">
                Winner #{winners.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Winners List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">
            🏆 Winners ({winners.length})
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <span className="text-xs text-gray-400 font-medium">
                    #{index + 1}
                  </span>
                  <span className="font-bold text-gray-700">
                    {results.find(result => result.number === winner)?.user?.full_name || `Number ${winner}`}
                  </span>
                  {results.find(result => result.number === winner)?.user?.id && (
                    <span className="text-xs text-gray-500">
                      ID: {results.find(result => result.number === winner).user.id}
                    </span>
                  )}
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