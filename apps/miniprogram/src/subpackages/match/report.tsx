import { View, Text } from "@tarojs/components";
import "./report.scss";

export default function ReportPage() {
  const reportData = {
    overallScore: 85,
    matchCount: 12,
    details: [
      { label: "学历匹配", score: 95, passed: true },
      { label: "专业匹配", score: 88, passed: true },
      { label: "政治面貌", score: 100, passed: true },
      { label: "工作经验", score: 60, passed: false },
    ],
  };

  return (
    <View className="report-page">
      <View className="report-header">
        <View className="overall-score">
          <Text className="score-value">{reportData.overallScore}</Text>
          <Text className="score-label">综合匹配度</Text>
        </View>
        <Text className="match-count">可报考 {reportData.matchCount} 个职位</Text>
      </View>

      <View className="report-section">
        <Text className="section-title">匹配详情</Text>
        {reportData.details.map((item, index) => (
          <View key={index} className="detail-item">
            <View className="detail-info">
              <Text className="detail-label">{item.label}</Text>
              <Text className={`detail-status ${item.passed ? "passed" : "failed"}`}>
                {item.passed ? "符合" : "不符合"}
              </Text>
            </View>
            <View className="detail-bar">
              <View className="bar-fill" style={{ width: `${item.score}%` }} />
            </View>
            <Text className="detail-score">{item.score}%</Text>
          </View>
        ))}
      </View>

      <View className="report-section">
        <Text className="section-title">建议</Text>
        <View className="suggestion-list">
          <Text className="suggestion-item">• 完善工作经验信息可提高匹配度</Text>
          <Text className="suggestion-item">• 考虑放宽地区限制可增加可报职位</Text>
        </View>
      </View>
    </View>
  );
}
