import { View, Text } from "@tarojs/components";
import "./index.scss";

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#52c41a";
    if (s >= 60) return "#1890ff";
    if (s >= 40) return "#faad14";
    return "#ff4d4f";
  };

  const color = getScoreColor(score);

  return (
    <View className="match-score-ring">
      <View
        className="match-score-ring__circle"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <View className="match-score-ring__value">
          <Text className="match-score-ring__number" style={{ color }}>
            {score}
          </Text>
          <Text className="match-score-ring__percent">%</Text>
        </View>
      </View>
      {showLabel && <Text className="match-score-ring__label">匹配度</Text>}
    </View>
  );
};

export default MatchScoreRing;
