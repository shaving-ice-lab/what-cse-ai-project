import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface MatchedPosition {
  id: number;
  name: string;
  department: string;
  matchScore: number;
  matchDetails: {
    education: boolean;
    major: boolean;
    political: boolean;
    experience: boolean;
  };
}

export default function MatchPage() {
  const matchedPositions: MatchedPosition[] = [
    {
      id: 1,
      name: "税务局科员",
      department: "国家税务总局北京市税务局",
      matchScore: 95,
      matchDetails: { education: true, major: true, political: true, experience: true },
    },
    {
      id: 2,
      name: "统计局科员",
      department: "国家统计局北京调查总队",
      matchScore: 88,
      matchDetails: { education: true, major: true, political: true, experience: false },
    },
    {
      id: 3,
      name: "海关科员",
      department: "北京海关",
      matchScore: 75,
      matchDetails: { education: true, major: false, political: true, experience: true },
    },
  ];

  const handlePositionClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/positions/detail?id=${id}` });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "excellent";
    if (score >= 75) return "good";
    return "normal";
  };

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
            <Text className="summary-value">3</Text>
            <Text className="summary-label">高度匹配</Text>
          </View>
          <View className="summary-item">
            <Text className="summary-value">12</Text>
            <Text className="summary-label">可报考</Text>
          </View>
        </View>
      </View>

      <View className="match-list">
        <View className="list-title">
          <Text>智能推荐</Text>
          <Text className="more">查看全部</Text>
        </View>
        {matchedPositions.map((position) => (
          <View
            key={position.id}
            className="match-card"
            onClick={() => handlePositionClick(position.id)}
          >
            <View className="card-main">
              <View className="card-info">
                <Text className="position-name">{position.name}</Text>
                <Text className="department">{position.department}</Text>
              </View>
              <View className={`score-circle ${getScoreColor(position.matchScore)}`}>
                <Text className="score-value">{position.matchScore}</Text>
                <Text className="score-unit">分</Text>
              </View>
            </View>
            <View className="match-tags">
              <Text className={`match-tag ${position.matchDetails.education ? "matched" : ""}`}>
                学历 {position.matchDetails.education ? "✓" : "✗"}
              </Text>
              <Text className={`match-tag ${position.matchDetails.major ? "matched" : ""}`}>
                专业 {position.matchDetails.major ? "✓" : "✗"}
              </Text>
              <Text className={`match-tag ${position.matchDetails.political ? "matched" : ""}`}>
                政治 {position.matchDetails.political ? "✓" : "✗"}
              </Text>
              <Text className={`match-tag ${position.matchDetails.experience ? "matched" : ""}`}>
                经验 {position.matchDetails.experience ? "✓" : "✗"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
