import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface PositionCardProps {
  id: number;
  name: string;
  department: string;
  location: string;
  matchScore?: number;
  education?: string;
  recruitCount?: number;
  onClick?: () => void;
}

export default function PositionCard({
  id,
  name,
  department,
  location,
  matchScore,
  education,
  recruitCount,
  onClick,
}: PositionCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/positions/detail?id=${id}` });
    }
  };

  return (
    <View className="position-card" onClick={handleClick}>
      <View className="card-header">
        <Text className="position-name">{name}</Text>
        {matchScore !== undefined && (
          <Text
            className={`match-score ${matchScore >= 80 ? "high" : matchScore >= 60 ? "medium" : "low"}`}
          >
            {matchScore}%
          </Text>
        )}
      </View>
      <Text className="department">{department}</Text>
      <View className="card-meta">
        <Text className="location">{location}</Text>
        {education && <Text className="education">{education}</Text>}
        {recruitCount && <Text className="recruit-count">招{recruitCount}人</Text>}
      </View>
    </View>
  );
}
