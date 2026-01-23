import { View, Text, Image } from "@tarojs/components";
import "./index.scss";

interface EmptyProps {
  image?: string;
  description?: string;
  children?: React.ReactNode;
}

const Empty: React.FC<EmptyProps> = ({ image, description = "暂无数据", children }) => {
  return (
    <View className="empty">
      {image ? (
        <Image className="empty__image" src={image} mode="aspectFit" />
      ) : (
        <View className="empty__icon">📭</View>
      )}
      <Text className="empty__description">{description}</Text>
      {children && <View className="empty__extra">{children}</View>}
    </View>
  );
};

export default Empty;
