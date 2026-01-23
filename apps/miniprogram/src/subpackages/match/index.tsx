import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function MatchPage() {
  const matchedPositions = [
    { id: 1, name: "税务局科员", dept: "国家税务总局", score: 95 },
    { id: 2, name: "统计局科员", dept: "国家统计局", score: 88 },
    { id: 3, name: "海关科员", dept: "北京海关", score: 75 },
  ];

  return (
    <View className="match-page">
      <View className="match-header">
        <View className="profile-status">
          <Text className="status-title">简历完整度</Text>
          <View className="progress-bar">
            <View className="progress-fill" style={{ width: "75%" }} />
          </View>
          <Text className="status-text">75%</Text>
        </View>
        <View className="match-summary">
          <View className="summary-item">
            <Text className="summary-value">{matchedPositions.length}</Text>
            <Text className="summary-label">匹配职位</Text>
          </View>
          <View className="summary-item">
            <Text className="summary-value">2</Text>
            <Text className="summary-label">高度匹配</Text>
          </View>
        </View>
      </View>

      <View className="match-list">
        <Text className="list-title">智能推荐</Text>
        {matchedPositions.map((pos) => (
          <View
            key={pos.id}
            className="match-card"
            onClick={() => Taro.navigateTo({ url: `/subpackages/positions/detail?id=${pos.id}` })}
          >
            <View className="card-info">
              <Text className="position-name">{pos.name}</Text>
              <Text className="dept">{pos.dept}</Text>
            </View>
            <View
              className={`score-circle ${pos.score >= 90 ? "excellent" : pos.score >= 75 ? "good" : "normal"}`}
            >
              <Text className="score-value">{pos.score}</Text>
              <Text className="score-unit">分</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
