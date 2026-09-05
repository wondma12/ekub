import React, { useState } from 'react';

const WinnerHistory = ({ results, maxDisplay = 20 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No draw history yet</p>
      </div>
    );
  }

  const displayResults = showAll ? results : results.slice(-maxDisplay);
  const hasMore = results.length > maxDisplay;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">📊 Winner History</h4>
        <span className="text-xs text-gray-400">{results.length} total</span>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayResults.map((result, index) => {
                const actualIndex = showAll ? index : results.length - displayResults.length + index;
                return (
                  <tr key={actualIndex} className="hover:bg-gray-100 transition-colors">
                    <td className="px-3 py-2 text-gray-400 text-xs">{actualIndex + 1}</td>
                    <td className="px-3 py-2 font-bold text-gray-700">
                      {result.user?.full_name || `User ${result.number}`}
                      {result.user?.id && <span className="block text-xs font-normal text-gray-500">ID: {result.user.id}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${result.selection_type === 'LUCKY' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                        }
                      `}>
                        {result.selection_type === 'LUCKY' ? '⭐ Lucky' : '🎲 Random'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">#{result.spin_number}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${results.length} results`}
        </button>
      )}
    </div>
  );
};

export default WinnerHistory;