import React from 'react';

const SpinButton = ({ 
  onClick, 
  disabled, 
  isSpinning, 
  label = 'SPIN',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isSpinning}
      className={`
        px-8 py-3 rounded-full
        font-bold text-white text-lg
        transition-all duration-300
        ${isSpinning 
          ? 'bg-gradient-to-r from-red-500 to-pink-500' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isSpinning ? (
        <span className="flex items-center gap-2">
          <span className="inline-flex gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.32s]"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.16s]"></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
          </span>
          Spinning...
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default SpinButton;