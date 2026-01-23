import { View, Text } from "@tarojs/components";
import { useState } from "react";
import "./notifications.scss";

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      title: "新职位推荐",
      content: "发现3个符合您条件的新职位",
      time: "2小时前",
      read: false,
    },
    { id: 2, title: "报名提醒", content: "2024国考报名即将截止", time: "1天前", read: true },
  ]);

  return (
    <View className="notifications-page">
      {notifications.length === 0 ? (
        <View className="empty">
          <Text>暂无消息</Text>
        </View>
      ) : (
        <View className="notification-list">
          {notifications.map((item) => (
            <View key={item.id} className={`notification-item ${item.read ? "read" : ""}`}>
              <View className="item-header">
                <Text className="title">{item.title}</Text>
                {!item.read && <View className="unread-dot" />}
              </View>
              <Text className="content">{item.content}</Text>
              <Text className="time">{item.time}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
