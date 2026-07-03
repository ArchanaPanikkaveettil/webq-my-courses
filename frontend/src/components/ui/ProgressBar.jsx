export default function ProgressBar({ value = 0, className = "" }) {
  const percentage = Math.min(Math.max(0, value), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-500">Progress</span>
        <span className="text-sm font-semibold text-purple-700">{percentage}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
