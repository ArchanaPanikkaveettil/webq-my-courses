export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100 hover:shadow-xl hover:shadow-purple-200",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 hover:shadow-xl",
    ghost: "text-purple-600 hover:bg-purple-50/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
