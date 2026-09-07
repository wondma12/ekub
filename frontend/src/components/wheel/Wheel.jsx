import React, { useState, useEffect, useRef } from 'react';

const Wheel = ({ 
  numbers, 
  winners, 
  onSpinComplete, 
  isSpinning, 
  onSpin,
  size = 500,
  disabled = false,
}) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);

  const colors = [
    '#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#4f46e5', '#7c3aed', '#db2777',
    '#e11d48', '#0f766e', '#2563eb', '#9333ea', '#ea580c',
  ];

  useEffect(() => {
    drawWheel();
  }, [numbers, winners, rotation]);

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
      const colorIndex = index % colors.length;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      if (isWinner) {
        ctx.fillStyle = '#16a34a';
        ctx.shadowColor = 'rgba(22, 163, 74, 0.75)';
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = colors[colorIndex];
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw number
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isWinner) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 17px Arial';
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
      }
      
      ctx.fillText(num, radius * 0.92, 0);
      ctx.restore();

      // Draw winner crown
      if (isWinner) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('', radius * 0.75, 0);
        ctx.restore();
      }
    });

    // Draw center circle
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    gradient.addColorStop(0, '#263746');
    gradient.addColorStop(1, '#111c26');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);

    // Draw pointer (triangle at top)
    ctx.beginPath();
    ctx.moveTo(centerX, 12);
    ctx.lineTo(centerX - 13, 31);
    ctx.lineTo(centerX + 13, 31);
    ctx.closePath();
    ctx.fillStyle = '#ef233c';
    ctx.fill();
    ctx.shadowColor = 'rgba(239, 35, 60, 0.35)';
    ctx.shadowBlur = 7;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const spinWheel = async () => {
    if (disabled || isSpinning || numbers.length === 0) return;

    const spinResult = await onSpin();
    if (!spinResult?.number) return;

    const selectedNumber = spinResult?.number;
    const selectedIndex = numbers.findIndex(number => number === selectedNumber);
    const sliceAngle = (2 * Math.PI) / numbers.length;
    const targetIndex = selectedIndex >= 0
      ? selectedIndex
      : Math.floor(Math.random() * numbers.length);
    const sliceCenterAngle = (targetIndex + 0.5) * sliceAngle;
    const pointerAngle = -Math.PI / 2;
    const rotationToTarget = ((pointerAngle - sliceCenterAngle - rotation) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

    const spins = 5 + Math.floor(Math.random() * 5);
    const targetRotation = rotation + spins * 2 * Math.PI + rotationToTarget;
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
        onSpinComplete(selectedNumber || numbers[targetIndex], spinResult);
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
        className="rounded-full shadow-2xl bg-[#101820]"
      />
      <button
        onClick={spinWheel}
        disabled={disabled || isSpinning || numbers.length === 0}
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-24 h-24 rounded-none border-4 border-white
          font-bold text-white text-lg
          transition-all duration-200
          ${disabled || isSpinning || numbers.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 hover:shadow-xl'
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