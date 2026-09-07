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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spin</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayResults.map((result, index) => {
                const actualIndex = showAll ? index : results.length - displayResults.length + index;
                return (
                  <tr key={actualIndex} className="hover:bg-gray-100 transition-colors">
                    <td className="px-3 py-2 text-gray-500 text-xs font-medium">
                      Spin {result.spin_number || actualIndex + 1}
                    </td>
                    <td className="px-3 py-2 font-bold text-gray-700">
                      {result.number}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Selected
                      </span>
                    </td>
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