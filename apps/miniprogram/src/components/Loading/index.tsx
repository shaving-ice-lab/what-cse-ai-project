import { View, Text } from "@tarojs/components";
import "./index.scss";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  text = "加载中...",
  size = "medium",
  fullScreen = false,
}) => {
  return (
    <View className={`loading ${fullScreen ? "loading--fullscreen" : ""}`}>
      <View className={`loading__spinner loading__spinner--${size}`} />
      {text && <Text className="loading__text">{text}</Text>}
    </View>
  );
};

export default Loading;
