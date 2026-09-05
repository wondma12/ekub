import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600',
      info: 'bg-cyan-600 text-white hover:bg-cyan-700',
      light: 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200',
      dark: 'bg-gray-800 text-white hover:bg-gray-900',
      'outline-primary': 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white',
      'outline-secondary': 'border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white',
      'outline-danger': 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
      'outline-success': 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white',
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md',
      md: 'px-5 py-2.5 text-sm rounded-lg',
      lg: 'px-7 py-3.5 text-base rounded-xl',
    };
    return sizes[size] || sizes.md;
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-60 cursor-not-allowed transform-none !shadow-none' : 'hover:-translate-y-0.5 active:translate-y-0'}
    ${className}
  `;

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.32s]"></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.16s]"></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="inline-flex">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex">{icon}</span>
      )}
    </button>
  );
};

export default Button;