import React from 'react';

const Loading = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text = 'Loading...',
  showText = true,
  className = '',
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    };
    return sizes[size] || sizes.md;
  };

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-indigo-500',
      secondary: 'bg-gray-500',
      light: 'bg-gray-200',
      dark: 'bg-gray-800',
    };
    return variants[variant] || variants.primary;
  };

  const Spinner = () => (
    <div className={`flex gap-2 ${getSizeClasses()} items-center justify-center`}>
      <div className={`${getVariantClasses()} rounded-full animate-bounce w-1/3 h-1/3 [animation-delay:-0.32s]`}></div>
      <div className={`${getVariantClasses()} rounded-full animate-bounce w-1/3 h-1/3 [animation-delay:-0.16s]`}></div>
      <div className={`${getVariantClasses()} rounded-full animate-bounce w-1/3 h-1/3`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm gap-4 ${className}`}>
        <Spinner />
        {showText && <p className="text-gray-600 font-medium text-sm">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-5 gap-3 ${className}`}>
      <Spinner />
      {showText && <p className="text-gray-600 font-medium text-sm">{text}</p>}
    </div>
  );
};

export default Loading;