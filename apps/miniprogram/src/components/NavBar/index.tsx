import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface NavBarProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  title = "",
  showBack = true,
  showHome = false,
  backgroundColor = "#ffffff",
  textColor = "#333333",
  onBack,
}) => {
  const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
  const systemInfo = Taro.getSystemInfoSync();

  const statusBarHeight = systemInfo.statusBarHeight || 20;
  const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack({ delta: 1 });
    }
  };

  const handleHome = () => {
    Taro.switchTab({ url: "/pages/index/index" });
  };

  return (
    <View
      className="nav-bar"
      style={{
        backgroundColor,
        paddingTop: `${statusBarHeight}px`,
        height: `${navBarHeight + statusBarHeight}px`,
      }}
    >
      <View className="nav-bar__content" style={{ height: `${navBarHeight}px` }}>
        <View className="nav-bar__left">
          {showBack && (
            <View className="nav-bar__back" onClick={handleBack}>
              <Text className="nav-bar__back-icon" style={{ color: textColor }}>
                ←
              </Text>
            </View>
          )}
          {showHome && (
            <View className="nav-bar__home" onClick={handleHome}>
              <Text className="nav-bar__home-icon" style={{ color: textColor }}>
                ⌂
              </Text>
            </View>
          )}
        </View>
        <View className="nav-bar__title">
          <Text style={{ color: textColor }}>{title}</Text>
        </View>
        <View className="nav-bar__right" />
      </View>
    </View>
  );
};

export default NavBar;
