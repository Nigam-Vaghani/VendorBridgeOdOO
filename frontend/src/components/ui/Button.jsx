import React from 'react';

const variantClasses = {
  default: 'bg-[#6322ef] text-white hover:bg-[#501cc3] focus:ring-[#6322ef]/30',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400/30',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400/30',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400/30',
  destructive: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 focus:ring-red-400/30',
  link: 'text-[#6322ef] underline-offset-4 hover:underline bg-transparent',
};

const sizeClasses = {
  default: 'h-9 px-4 py-2 text-sm',
  sm: 'h-7 px-3 text-xs',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
  xs: 'h-6 px-2 text-xs',
};

const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', size = 'default', disabled, children, type = 'button', ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none';

  const variantCls = variantClasses[variant] ?? variantClasses.default;
  const sizeCls = sizeClasses[size] ?? sizeClasses.default;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${base} ${variantCls} ${sizeCls} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export { Button };
export default Button;
