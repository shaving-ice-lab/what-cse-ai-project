import { View, Text, Switch } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./preferences.scss";

interface Preferences {
  pushNotification: boolean;
  examReminder: boolean;
  positionRecommend: boolean;
  nightMode: boolean;
  autoPlay: boolean;
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    pushNotification: true,
    examReminder: true,
    positionRecommend: true,
    nightMode: false,
    autoPlay: false,
  });

  const handleToggle = (key: keyof Preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: "清除缓存",
      content: "确定要清除本地缓存数据吗？",
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: "清除中..." });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: "清除成功", icon: "success" });
          }, 500);
        }
      },
    });
  };

  const preferenceItems = [
    {
      title: "消息通知",
      items: [
        { key: "pushNotification", label: "推送通知", desc: "接收系统推送消息" },
        { key: "examReminder", label: "考试提醒", desc: "报名、考试时间提醒" },
        { key: "positionRecommend", label: "职位推荐", desc: "新匹配职位通知" },
      ],
    },
    {
      title: "显示设置",
      items: [
        { key: "nightMode", label: "夜间模式", desc: "降低屏幕亮度" },
        { key: "autoPlay", label: "自动播放", desc: "视频/动画自动播放" },
      ],
    },
  ];

  return (
    <View className="preferences-page">
      {preferenceItems.map((group, groupIndex) => (
        <View key={groupIndex} className="preference-group">
          <Text className="group-title">{group.title}</Text>
          <View className="group-list">
            {group.items.map((item) => (
              <View key={item.key} className="preference-item">
                <View className="item-info">
                  <Text className="item-label">{item.label}</Text>
                  <Text className="item-desc">{item.desc}</Text>
                </View>
                <Switch
                  checked={preferences[item.key as keyof Preferences]}
                  onChange={() => handleToggle(item.key as keyof Preferences)}
                  color="#1890ff"
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="preference-group">
        <Text className="group-title">其他</Text>
        <View className="group-list">
          <View className="preference-item clickable" onClick={handleClearCache}>
            <View className="item-info">
              <Text className="item-label">清除缓存</Text>
              <Text className="item-desc">清除本地缓存数据</Text>
            </View>
            <Text className="item-arrow">›</Text>
          </View>
          <View className="preference-item clickable">
            <View className="item-info">
              <Text className="item-label">关于我们</Text>
              <Text className="item-desc">版本 1.0.0</Text>
            </View>
            <Text className="item-arrow">›</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
