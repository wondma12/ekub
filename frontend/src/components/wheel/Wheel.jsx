import React, { useState, useEffect, useRef } from 'react';

const Wheel = ({ 
  numbers, 
  winners, 
  onSpinComplete, 
  isSpinning, 
  onSpin,
  luckyNumbers = [],
  size = 500,
  disabled = false,
}) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const animationRef = useRef(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
    '#E59866', '#A9DFBF', '#F5B7B1', '#AED6F1', '#F9E79F',
  ];

  useEffect(() => {
    drawWheel();
  }, [numbers, winners, luckyNumbers, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (numbers.length === 0) {
      ctx.fillStyle = '#ccc';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No numbers', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / numbers.length;

    numbers.forEach((num, index) => {
      const startAngle = index * sliceAngle + rotation;
      const endAngle = startAngle + sliceAngle;

      const isWinner = winners.includes(num);
      const isLucky = luckyNumbers.includes(num);
      const colorIndex = index % colors.length;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      if (isWinner) {
        ctx.fillStyle = '#28a745';
        ctx.shadowColor = 'rgba(40, 167, 69, 0.5)';
        ctx.shadowBlur = 20;
      } else if (isLucky) {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = colors[colorIndex];
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isWinner) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
      } else if (isLucky) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
      }
      
      ctx.fillText(num, radius * 0.65, 0);
      ctx.restore();

      // Draw lucky star
      if (isLucky && !isWinner) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('⭐', radius * 0.85, 0);
        ctx.restore();
      }

      // Draw winner crown
      if (isWinner) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('👑', radius * 0.85, 0);
        ctx.restore();
      }
    });

    // Draw center circle
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#f0f0f0');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);

    // Draw pointer (triangle at top)
    ctx.beginPath();
    ctx.moveTo(centerX, 15);
    ctx.lineTo(centerX - 15, 35);
    ctx.lineTo(centerX + 15, 35);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.shadowColor = 'rgba(255, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const spinWheel = () => {
    if (disabled || isSpinning || numbers.length === 0) return;

    onSpin();

    const spins = 5 + Math.random() * 5;
    const targetRotation = rotation + spins * 2 * Math.PI + Math.random() * 0.5;
    const duration = 4000 + Math.random() * 1000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function - cubic ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * eased;

      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        // Calculate winner
        const sliceAngle = (2 * Math.PI) / numbers.length;
        const pointerAngle = (2 * Math.PI - targetRotation % (2 * Math.PI)) % (2 * Math.PI);
        const winnerIndex = Math.floor(pointerAngle / sliceAngle);
        const winner = numbers[winnerIndex % numbers.length];
        onSpinComplete(winner);
      }
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-2xl bg-white"
      />
      <button
        onClick={spinWheel}
        disabled={disabled || isSpinning || numbers.length === 0}
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-20 h-20 rounded-full border-4 border-white
          font-bold text-white text-lg
          transition-all duration-200
          ${disabled || isSpinning || numbers.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-xl'
          }
          shadow-lg
        `}
      >
        {isSpinning ? (
          <span className="flex gap-1 justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.32s]"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.16s]"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
          </span>
        ) : (
          'SPIN'
        )}
      </button>
    </div>
  );
};

export default Wheel;