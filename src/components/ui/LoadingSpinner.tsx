export interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "medium",
  color = "text-primary-500",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-transparent ${sizeClasses[size]} ${color} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
