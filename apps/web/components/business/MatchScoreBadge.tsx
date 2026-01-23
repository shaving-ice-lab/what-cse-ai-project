interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  score,
  size = "md",
  showLabel = true,
  className = "",
}: MatchScoreBadgeProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 90) return { color: "text-green-600 bg-green-100", label: "极高匹配" };
    if (score >= 80) return { color: "text-green-500 bg-green-50", label: "高度匹配" };
    if (score >= 70) return { color: "text-blue-500 bg-blue-50", label: "较好匹配" };
    if (score >= 60) return { color: "text-yellow-500 bg-yellow-50", label: "一般匹配" };
    return { color: "text-red-500 bg-red-50", label: "低匹配度" };
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const { color, label } = getScoreConfig(score);

  return (
    <div
      className={`inline-flex items-center space-x-1 rounded-full font-medium ${color} ${sizeClasses[size]} ${className}`}
    >
      <span>{score}分</span>
      {showLabel && <span className="opacity-80">· {label}</span>}
    </div>
  );
}
