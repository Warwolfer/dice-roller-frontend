import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500';
      break;
    case 'secondary':
      variantStyles = 'bg-slate-600 hover:bg-slate-700 text-slate-100 focus:ring-slate-500';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2 text-sm';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-base';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;