import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./favorites.scss";

interface FavoritePosition {
  id: number;
  name: string;
  department: string;
  location: string;
  matchScore: number;
  addTime: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePosition[]>([
    {
      id: 1,
      name: "税务局科员",
      department: "国家税务总局北京市税务局",
      location: "北京",
      matchScore: 85,
      addTime: "2024-01-15",
    },
    {
      id: 2,
      name: "海关科员",
      department: "北京海关",
      location: "北京",
      matchScore: 78,
      addTime: "2024-01-14",
    },
    {
      id: 3,
      name: "统计局科员",
      department: "国家统计局上海调查总队",
      location: "上海",
      matchScore: 92,
      addTime: "2024-01-13",
    },
  ]);

  const handlePositionClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/positions/detail?id=${id}` });
  };

  const handleRemove = (e: any, id: number) => {
    e.stopPropagation();
    Taro.showModal({
      title: "提示",
      content: "确定取消收藏吗？",
      success: (res) => {
        if (res.confirm) {
          setFavorites(favorites.filter((f) => f.id !== id));
          Taro.showToast({ title: "已取消收藏", icon: "success" });
        }
      },
    });
  };

  return (
    <View className="favorites-page">
      {favorites.length === 0 ? (
        <View className="empty-state">
          <Text className="empty-icon">☆</Text>
          <Text className="empty-text">暂无收藏职位</Text>
          <View
            className="empty-btn"
            onClick={() => Taro.switchTab({ url: "/pages/positions/index" })}
          >
            去看看
          </View>
        </View>
      ) : (
        <View className="favorites-list">
          {favorites.map((item) => (
            <View
              key={item.id}
              className="favorite-card"
              onClick={() => handlePositionClick(item.id)}
            >
              <View className="card-main">
                <View className="card-info">
                  <Text className="position-name">{item.name}</Text>
                  <Text className="department">{item.department}</Text>
                  <View className="card-meta">
                    <Text className="location">{item.location}</Text>
                    <Text className="add-time">收藏于 {item.addTime}</Text>
                  </View>
                </View>
                <View className="card-action">
                  <Text className="match-score">{item.matchScore}%</Text>
                  <Text className="remove-btn" onClick={(e) => handleRemove(e, item.id)}>
                    取消收藏
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
