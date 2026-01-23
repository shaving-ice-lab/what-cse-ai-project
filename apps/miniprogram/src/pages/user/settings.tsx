import { View, Text, Switch } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { useAuthStore } from "../../stores";
import "./settings.scss";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    newPosition: true,
    deadline: true,
  });
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Taro.showModal({
      title: "提示",
      content: "确定退出登录？",
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: "已退出登录", icon: "success" });
          setTimeout(() => {
            Taro.switchTab({ url: "/pages/index/index" });
          }, 1500);
        }
      },
    });
  };

  return (
    <View className="settings-page">
      <View className="settings-section">
        <Text className="section-title">消息通知</Text>
        <View className="setting-item">
          <Text className="item-label">推送通知</Text>
          <Switch
            checked={settings.pushEnabled}
            onChange={(e) => setSettings({ ...settings, pushEnabled: e.detail.value })}
          />
        </View>
        <View className="setting-item">
          <Text className="item-label">新职位提醒</Text>
          <Switch
            checked={settings.newPosition}
            onChange={(e) => setSettings({ ...settings, newPosition: e.detail.value })}
          />
        </View>
        <View className="setting-item">
          <Text className="item-label">截止日期提醒</Text>
          <Switch
            checked={settings.deadline}
            onChange={(e) => setSettings({ ...settings, deadline: e.detail.value })}
          />
        </View>
      </View>

      <View className="settings-section">
        <Text className="section-title">其他</Text>
        <View
          className="setting-item"
          onClick={() => Taro.navigateTo({ url: "/pages/user/about" })}
        >
          <Text className="item-label">关于我们</Text>
          <Text className="item-arrow">›</Text>
        </View>
        <View className="setting-item">
          <Text className="item-label">当前版本</Text>
          <Text className="item-value">1.0.0</Text>
        </View>
      </View>

      <View className="logout-btn" onClick={handleLogout}>
        <Text>退出登录</Text>
      </View>
    </View>
  );
}
