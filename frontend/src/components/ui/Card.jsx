export default function Card({ children, className = "", hover = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-6 shadow-xs ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
