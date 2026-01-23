import { View, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.scss";

export default function Index() {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword.trim()) {
      Taro.navigateTo({
        url: `/pages/positions/search?keyword=${keyword}`,
      });
    }
  };

  const quickFilters = [
    { label: "国考", type: "guokao" },
    { label: "省考", type: "shengkao" },
    { label: "事业编", type: "shiyebian" },
    { label: "选调生", type: "xuandiao" },
  ];

  const features = [
    { icon: "🎯", title: "智能匹配", desc: "一键匹配适合职位" },
    { icon: "📊", title: "数据分析", desc: "历年报考数据" },
    { icon: "🔔", title: "考试提醒", desc: "不错过重要时间" },
    { icon: "📝", title: "职位对比", desc: "多维度分析" },
  ];

  return (
    <View className="index-page">
      <View className="search-section">
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

      <View className="quick-filter">
        <View className="section-title">快捷筛选</View>
        <View className="filter-list">
          {quickFilters.map((item) => (
            <View
              key={item.type}
              className="filter-item"
              onClick={() => Taro.navigateTo({ url: `/pages/positions/index?type=${item.type}` })}
            >
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="features">
        <View className="section-title">核心功能</View>
        <View className="feature-grid">
          {features.map((item, index) => (
            <View key={index} className="feature-item">
              <Text className="feature-icon">{item.icon}</Text>
              <Text className="feature-title">{item.title}</Text>
              <Text className="feature-desc">{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="hot-positions">
        <View className="section-title">热门职位</View>
        <View className="position-list">
          {[1, 2, 3].map((i) => (
            <View key={i} className="position-card">
              <View className="position-name">税务局科员</View>
              <View className="position-dept">国家税务总局北京市税务局</View>
              <View className="position-tags">
                <Text className="tag">北京</Text>
                <Text className="tag">本科</Text>
                <Text className="tag">不限专业</Text>
              </View>
              <View className="position-footer">
                <Text className="recruit">招录 3 人</Text>
                <Text className="match-score">匹配度 85%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
