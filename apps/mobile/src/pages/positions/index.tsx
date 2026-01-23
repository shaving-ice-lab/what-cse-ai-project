import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.scss";

interface Position {
  id: number;
  name: string;
  department: string;
  location: string;
  education: string;
  major: string;
  recruitCount: number;
  matchScore: number;
}

export default function PositionsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all", label: "全部" },
    { key: "guokao", label: "国考" },
    { key: "shengkao", label: "省考" },
    { key: "shiyebian", label: "事业编" },
  ];

  const positions: Position[] = [
    {
      id: 1,
      name: "税务局科员",
      department: "国家税务总局北京市税务局",
      location: "北京",
      education: "本科",
      major: "不限专业",
      recruitCount: 3,
      matchScore: 85,
    },
    {
      id: 2,
      name: "海关科员",
      department: "北京海关",
      location: "北京",
      education: "本科",
      major: "法学类",
      recruitCount: 2,
      matchScore: 78,
    },
    {
      id: 3,
      name: "统计局科员",
      department: "国家统计局上海调查总队",
      location: "上海",
      education: "本科",
      major: "统计学",
      recruitCount: 1,
      matchScore: 92,
    },
    {
      id: 4,
      name: "市场监管科员",
      department: "广东省市场监督管理局",
      location: "广州",
      education: "本科",
      major: "工商管理",
      recruitCount: 5,
      matchScore: 72,
    },
  ];

  const handlePositionClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/positions/detail?id=${id}` });
  };

  const handleFilterClick = () => {
    Taro.navigateTo({ url: "/pages/positions/filter" });
  };

  return (
    <View className="positions-page">
      <View className="filter-bar">
        <ScrollView scrollX className="filter-scroll">
          {filters.map((filter) => (
            <View
              key={filter.key}
              className={`filter-tab ${activeFilter === filter.key ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </View>
          ))}
        </ScrollView>
        <View className="filter-btn" onClick={handleFilterClick}>
          <Text>筛选</Text>
        </View>
      </View>

      <View className="position-list">
        {positions.map((position) => (
          <View
            key={position.id}
            className="position-card"
            onClick={() => handlePositionClick(position.id)}
          >
            <View className="card-header">
              <Text className="position-name">{position.name}</Text>
              <Text className="match-score">{position.matchScore}%</Text>
            </View>
            <Text className="department">{position.department}</Text>
            <View className="tags">
              <Text className="tag">{position.location}</Text>
              <Text className="tag">{position.education}</Text>
              <Text className="tag">{position.major}</Text>
            </View>
            <View className="card-footer">
              <Text className="recruit">招录 {position.recruitCount} 人</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
