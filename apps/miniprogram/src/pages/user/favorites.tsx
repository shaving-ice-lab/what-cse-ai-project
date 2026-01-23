import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./favorites.scss";

export default function FavoritesPage() {
  const [favorites] = useState([
    { id: 1, name: "税务局科员", dept: "国家税务总局", location: "北京" },
    { id: 2, name: "海关科员", dept: "北京海关", location: "北京" },
  ]);

  const handleRemove = (id: number) => {
    Taro.showModal({
      title: "提示",
      content: "确定取消收藏？",
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: "已取消收藏", icon: "success" });
        }
      },
    });
  };

  return (
    <View className="favorites-page">
      {favorites.length === 0 ? (
        <View className="empty">
          <Text>暂无收藏</Text>
        </View>
      ) : (
        <View className="favorites-list">
          {favorites.map((item) => (
            <View key={item.id} className="favorite-item">
              <View
                className="item-info"
                onClick={() =>
                  Taro.navigateTo({ url: `/subpackages/positions/detail?id=${item.id}` })
                }
              >
                <Text className="name">{item.name}</Text>
                <Text className="dept">{item.dept}</Text>
                <Text className="location">{item.location}</Text>
              </View>
              <Text className="remove-btn" onClick={() => handleRemove(item.id)}>
                取消收藏
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
