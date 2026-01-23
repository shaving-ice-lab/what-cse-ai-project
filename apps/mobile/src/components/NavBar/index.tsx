import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface NavBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export default function NavBar({ title, showBack = true, onBack, rightContent }: NavBarProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className="nav-bar">
      <View className="nav-bar-left">
        {showBack && (
          <View className="back-btn" onClick={handleBack}>
            <Text className="back-icon">‹</Text>
          </View>
        )}
      </View>
      <View className="nav-bar-center">
        <Text className="nav-title">{title}</Text>
      </View>
      <View className="nav-bar-right">{rightContent}</View>
    </View>
  );
}
