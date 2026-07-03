export default function Badge({ children, type = "info", className = "" }) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider";
  
  const types = {
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200"
  };

  return (
    <span className={`${baseStyles} ${types[type]} ${className}`}>
      {children}
    </span>
  );
}
