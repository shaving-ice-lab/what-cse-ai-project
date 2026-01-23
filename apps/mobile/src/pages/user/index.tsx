import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function UserPage() {
  const isLoggedIn = true;

  const userInfo = {
    nickname: "张三",
    avatar: "",
    phone: "138****8888",
    profileComplete: 75,
  };

  const menuGroups = [
    {
      title: "我的服务",
      items: [
        { icon: "📝", label: "我的简历", path: "/pages/user/profile" },
        { icon: "⭐", label: "我的收藏", path: "/pages/user/favorites" },
        { icon: "🔔", label: "消息通知", path: "/pages/user/notifications", badge: 3 },
        { icon: "📊", label: "匹配报告", path: "/pages/match/report" },
      ],
    },
    {
      title: "更多功能",
      items: [
        { icon: "⚙️", label: "偏好设置", path: "/pages/user/preferences" },
        { icon: "📖", label: "使用帮助", path: "/pages/help" },
        { icon: "💬", label: "意见反馈", path: "/pages/feedback" },
        { icon: "ℹ️", label: "关于我们", path: "/pages/about" },
      ],
    },
  ];

  const handleLogin = () => {
    Taro.navigateTo({ url: "/pages/user/login" });
  };

  const handleMenuClick = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="user-page">
      <View className="user-header">
        {isLoggedIn ? (
          <View className="user-info">
            <View className="avatar-wrapper">
              {userInfo.avatar ? (
                <Image className="avatar" src={userInfo.avatar} />
              ) : (
                <View className="avatar-placeholder">{userInfo.nickname.slice(0, 1)}</View>
              )}
            </View>
            <View className="info-text">
              <Text className="nickname">{userInfo.nickname}</Text>
              <Text className="phone">{userInfo.phone}</Text>
            </View>
            <View className="profile-progress">
              <Text className="progress-text">简历完整度 {userInfo.profileComplete}%</Text>
              <View className="progress-bar">
                <View className="progress-fill" style={{ width: `${userInfo.profileComplete}%` }} />
              </View>
            </View>
          </View>
        ) : (
          <View className="login-prompt" onClick={handleLogin}>
            <View className="avatar-placeholder">?</View>
            <Text className="login-text">点击登录</Text>
          </View>
        )}
      </View>

      <View className="stats-row">
        <View className="stat-item">
          <Text className="stat-value">12</Text>
          <Text className="stat-label">收藏职位</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-value">5</Text>
          <Text className="stat-label">浏览记录</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-value">3</Text>
          <Text className="stat-label">报考日程</Text>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className="menu-group">
          <Text className="group-title">{group.title}</Text>
          <View className="menu-list">
            {group.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                className="menu-item"
                onClick={() => handleMenuClick(item.path)}
              >
                <Text className="menu-icon">{item.icon}</Text>
                <Text className="menu-label">{item.label}</Text>
                {item.badge && <Text className="menu-badge">{item.badge}</Text>}
                <Text className="menu-arrow">›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {isLoggedIn && (
        <View className="logout-btn">
          <Text>退出登录</Text>
        </View>
      )}
    </View>
  );
}
