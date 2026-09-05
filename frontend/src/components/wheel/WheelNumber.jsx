import React from 'react';

const WheelNumber = ({ number, isWinner, isLucky, isSelected, onClick }) => {
  const getClasses = () => {
    const base = `
      relative inline-flex items-center justify-center
      w-12 h-12 rounded-full
      font-semibold text-sm
      transition-all duration-300
      cursor-pointer hover:scale-110
    `;

    if (isWinner) {
      return `${base} bg-green-500 text-white shadow-lg shadow-green-500/50 scale-110`;
    }
    if (isLucky) {
      return `${base} bg-yellow-400 text-gray-800 shadow-lg shadow-yellow-400/50`;
    }
    if (isSelected) {
      return `${base} bg-indigo-500 text-white shadow-lg shadow-indigo-500/50`;
    }
    return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
  };

  return (
    <div className={getClasses()} onClick={() => onClick && onClick(number)}>
      <span className="relative z-10">{number}</span>
      {isLucky && !isWinner && (
        <span className="absolute -top-2 -right-2 text-xs">⭐</span>
      )}
      {isWinner && (
        <span className="absolute -top-2 -right-2 text-xs">👑</span>
      )}
    </div>
  );
};

export default WheelNumber;