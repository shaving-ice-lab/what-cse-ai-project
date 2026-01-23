import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.scss";

export default function PositionsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all", label: "全部" },
    { key: "guokao", label: "国考" },
    { key: "shengkao", label: "省考" },
  ];

  const positions = [
    { id: 1, name: "税务局科员", dept: "国家税务总局北京市税务局", location: "北京", match: 85 },
    { id: 2, name: "海关科员", dept: "北京海关", location: "北京", match: 78 },
    { id: 3, name: "统计局科员", dept: "国家统计局", location: "上海", match: 92 },
  ];

  return (
    <View className="positions-page">
      <View className="filter-bar">
        <ScrollView scrollX className="filter-scroll">
          {filters.map((f) => (
            <View
              key={f.key}
              className={`filter-tab ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </View>
          ))}
        </ScrollView>
        <View
          className="filter-btn"
          onClick={() => Taro.navigateTo({ url: "/subpackages/positions/filter" })}
        >
          筛选
        </View>
      </View>

      <View className="position-list">
        {positions.map((pos) => (
          <View
            key={pos.id}
            className="position-card"
            onClick={() => Taro.navigateTo({ url: `/subpackages/positions/detail?id=${pos.id}` })}
          >
            <View className="card-header">
              <Text className="position-name">{pos.name}</Text>
              <Text className="match-score">{pos.match}%</Text>
            </View>
            <Text className="dept">{pos.dept}</Text>
            <Text className="location">{pos.location}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
