import React, { useEffect, useRef, useState } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  actions,
  preventScroll = true,
  animation = 'slide',
}) => {
  const modalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
      setIsAnimating(true);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnOverlayClick, preventScroll]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen && !isAnimating) return null;

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      '2xl': 'max-w-6xl',
      full: 'max-w-full mx-4',
    };
    return sizes[size] || sizes.md;
  };

  const getAnimationClasses = () => {
    if (!isAnimating) {
      return 'opacity-0 scale-95';
    }
    
    if (animation === 'slide') {
      return 'opacity-100 scale-100';
    }
    
    if (animation === 'fade') {
      return 'opacity-100';
    }
    
    if (animation === 'zoom') {
      return 'opacity-100 scale-100';
    }
    
    return 'opacity-100 scale-100';
  };

  const getOverlayAnimationClasses = () => {
    if (!isAnimating) {
      return 'opacity-0';
    }
    return 'opacity-100';
  };

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        transition-all duration-200 ease-in-out
        ${getOverlayAnimationClasses()}
        ${isAnimating ? 'pointer-events-auto' : 'pointer-events-none'}
      `}
      style={{
        animation: isAnimating ? 'fadeIn 0.2s ease-in' : 'none',
      }}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-2xl shadow-2xl
          w-full
          flex flex-col
          transition-all duration-200 ease-in-out
          ${getAnimationClasses()}
          ${getSizeClasses()}
          ${className}
          max-h-[90vh]
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{
          transform: isAnimating ? 'none' : 'scale(0.95) translateY(10px)',
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer with actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>

    </div>
  );
};

export default Modal;