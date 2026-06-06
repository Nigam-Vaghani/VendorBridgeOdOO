export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "w-full rounded-md px-4 py-2 text-sm font-semibold cursor-pointer transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
