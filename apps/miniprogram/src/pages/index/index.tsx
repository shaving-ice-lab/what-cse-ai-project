import { View, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.scss";

export default function Index() {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword.trim()) {
      Taro.navigateTo({
        url: `/subpackages/positions/search?keyword=${keyword}`,
      });
    }
  };

  const quickEntries = [
    { icon: "🎯", label: "智能匹配", path: "/subpackages/match/index" },
    { icon: "📋", label: "职位筛选", path: "/subpackages/positions/index" },
    { icon: "📢", label: "公告资讯", path: "/subpackages/announcements/index" },
    { icon: "⭐", label: "我的收藏", path: "/pages/user/favorites" },
  ];

  const hotPositions = [
    { id: 1, name: "税务局科员", dept: "国家税务总局北京市税务局", match: 85 },
    { id: 2, name: "海关科员", dept: "北京海关", match: 78 },
    { id: 3, name: "统计局科员", dept: "国家统计局", match: 92 },
  ];

  return (
    <View className="index-page">
      <View className="search-header">
        <View className="search-box">
          <Input
            className="search-input"
            placeholder="搜索职位、单位、地区"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <View className="search-btn" onClick={handleSearch}>
            搜索
          </View>
        </View>
      </View>

      <View className="quick-entry">
        {quickEntries.map((entry, index) => (
          <View
            key={index}
            className="entry-item"
            onClick={() => Taro.navigateTo({ url: entry.path })}
          >
            <Text className="entry-icon">{entry.icon}</Text>
            <Text className="entry-label">{entry.label}</Text>
          </View>
        ))}
      </View>

      <View className="section">
        <View className="section-header">
          <Text className="section-title">热门职位</Text>
          <Text
            className="section-more"
            onClick={() => Taro.navigateTo({ url: "/subpackages/positions/index" })}
          >
            更多 ›
          </Text>
        </View>
        <View className="position-list">
          {hotPositions.map((pos) => (
            <View
              key={pos.id}
              className="position-item"
              onClick={() => Taro.navigateTo({ url: `/subpackages/positions/detail?id=${pos.id}` })}
            >
              <View className="position-info">
                <Text className="position-name">{pos.name}</Text>
                <Text className="position-dept">{pos.dept}</Text>
              </View>
              <Text className="position-match">{pos.match}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
