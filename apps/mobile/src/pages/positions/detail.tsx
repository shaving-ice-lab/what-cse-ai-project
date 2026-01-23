import { View, Text, ScrollView, Button } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useState } from "react";
import "./detail.scss";

export default function PositionDetailPage() {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const position = {
    id: router.params.id,
    name: "税务局科员",
    department: "国家税务总局北京市税务局",
    departmentCode: "100001001",
    location: "北京市东城区",
    education: "本科及以上",
    degree: "学士",
    major: "经济学类、财政学类、工商管理类",
    political: "中共党员",
    experience: "2年以上基层工作经历",
    recruitCount: 3,
    examRatio: "5:1",
    note: "本岗位需要经常出差",
    matchScore: 85,
    matchDetails: [
      { label: "学历", matched: true, detail: "本科 ≥ 本科" },
      { label: "专业", matched: true, detail: "经济学 ∈ 经济学类" },
      { label: "政治面貌", matched: true, detail: "党员 = 党员" },
      { label: "工作经验", matched: false, detail: "1年 < 2年" },
    ],
    historyData: [
      { year: "2023", applicants: 245, ratio: "81:1" },
      { year: "2022", applicants: 198, ratio: "66:1" },
      { year: "2021", applicants: 156, ratio: "52:1" },
    ],
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({
      title: isFavorite ? "已取消收藏" : "收藏成功",
      icon: "success",
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  const handleApply = () => {
    Taro.showModal({
      title: "提示",
      content: "即将跳转到官方报名系统",
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: "功能开发中", icon: "none" });
        }
      },
    });
  };

  return (
    <View className="detail-page">
      <ScrollView scrollY className="detail-content">
        <View className="position-header">
          <Text className="position-name">{position.name}</Text>
          <Text className="department">{position.department}</Text>
          <View className="match-badge">
            <Text className="match-score">{position.matchScore}%</Text>
            <Text className="match-label">匹配度</Text>
          </View>
        </View>

        <View className="info-section">
          <Text className="section-title">基本信息</Text>
          <View className="info-grid">
            <View className="info-item">
              <Text className="info-label">工作地点</Text>
              <Text className="info-value">{position.location}</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">学历要求</Text>
              <Text className="info-value">{position.education}</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">招录人数</Text>
              <Text className="info-value">{position.recruitCount}人</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">开考比例</Text>
              <Text className="info-value">{position.examRatio}</Text>
            </View>
          </View>
        </View>

        <View className="info-section">
          <Text className="section-title">报考条件</Text>
          <View className="condition-list">
            <View className="condition-item">
              <Text className="condition-label">专业要求</Text>
              <Text className="condition-value">{position.major}</Text>
            </View>
            <View className="condition-item">
              <Text className="condition-label">政治面貌</Text>
              <Text className="condition-value">{position.political}</Text>
            </View>
            <View className="condition-item">
              <Text className="condition-label">工作经验</Text>
              <Text className="condition-value">{position.experience}</Text>
            </View>
            <View className="condition-item">
              <Text className="condition-label">备注</Text>
              <Text className="condition-value">{position.note}</Text>
            </View>
          </View>
        </View>

        <View className="info-section">
          <Text className="section-title">匹配分析</Text>
          <View className="match-list">
            {position.matchDetails.map((item, index) => (
              <View key={index} className={`match-item ${item.matched ? "matched" : "unmatched"}`}>
                <Text className="match-label">{item.label}</Text>
                <Text className="match-detail">{item.detail}</Text>
                <Text className="match-icon">{item.matched ? "✓" : "✗"}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="info-section">
          <Text className="section-title">历年数据</Text>
          <View className="history-table">
            <View className="table-header">
              <Text className="table-cell">年份</Text>
              <Text className="table-cell">报名人数</Text>
              <Text className="table-cell">竞争比</Text>
            </View>
            {position.historyData.map((item, index) => (
              <View key={index} className="table-row">
                <Text className="table-cell">{item.year}</Text>
                <Text className="table-cell">{item.applicants}</Text>
                <Text className="table-cell">{item.ratio}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="detail-footer">
        <View className="action-btn" onClick={handleFavorite}>
          <Text className={`action-icon ${isFavorite ? "active" : ""}`}>
            {isFavorite ? "★" : "☆"}
          </Text>
          <Text className="action-text">收藏</Text>
        </View>
        <View className="action-btn" onClick={handleShare}>
          <Text className="action-icon">↗</Text>
          <Text className="action-text">分享</Text>
        </View>
        <View className="apply-btn" onClick={handleApply}>
          <Text>立即报考</Text>
        </View>
      </View>
    </View>
  );
}
