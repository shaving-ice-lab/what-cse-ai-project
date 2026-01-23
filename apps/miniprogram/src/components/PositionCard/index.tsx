import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface Position {
  id: number;
  position_id: string;
  position_name: string;
  department_name: string;
  work_location_province: string;
  work_location_city: string;
  education_min: string;
  recruit_count: number;
  exam_type: string;
  match_score?: number;
}

interface PositionCardProps {
  position: Position;
  showMatchScore?: boolean;
  onClick?: () => void;
}

const PositionCard: React.FC<PositionCardProps> = ({
  position,
  showMatchScore = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/subpackages/positions/detail/index?id=${position.id}`,
      });
    }
  };

  return (
    <View className="position-card" onClick={handleClick}>
      <View className="position-card__header">
        <Text className="position-card__name">{position.position_name}</Text>
        {showMatchScore && position.match_score !== undefined && (
          <View className="position-card__score">
            <Text className="position-card__score-value">{position.match_score}%</Text>
            <Text className="position-card__score-label">匹配度</Text>
          </View>
        )}
      </View>

      <Text className="position-card__department">{position.department_name}</Text>

      <View className="position-card__tags">
        <View className="position-card__tag">
          <Text>
            {position.work_location_province} {position.work_location_city}
          </Text>
        </View>
        <View className="position-card__tag">
          <Text>{position.education_min}</Text>
        </View>
        <View className="position-card__tag">
          <Text>招{position.recruit_count}人</Text>
        </View>
        <View className="position-card__tag position-card__tag--type">
          <Text>{position.exam_type}</Text>
        </View>
      </View>
    </View>
  );
};

export default PositionCard;
