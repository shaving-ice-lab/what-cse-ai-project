import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./compare.scss";

interface Position {
  id: number;
  name: string;
  department: string;
  location: string;
  education: string;
  major: string;
  political: string;
  experience: string;
  recruitCount: number;
  examRatio: string;
  matchScore: number;
}

export default function PositionComparePage() {
  const positions: Position[] = [
    {
      id: 1,
      name: "税务局科员",
      department: "国家税务总局北京市税务局",
      location: "北京市东城区",
      education: "本科及以上",
      major: "经济学类、财政学类",
      political: "中共党员",
      experience: "2年以上",
      recruitCount: 3,
      examRatio: "5:1",
      matchScore: 85,
    },
    {
      id: 2,
      name: "海关科员",
      department: "北京海关",
      location: "北京市朝阳区",
      education: "本科及以上",
      major: "法学类、国际贸易",
      political: "不限",
      experience: "不限",
      recruitCount: 2,
      examRatio: "3:1",
      matchScore: 78,
    },
  ];

  const compareFields = [
    { key: "department", label: "招录单位" },
    { key: "location", label: "工作地点" },
    { key: "education", label: "学历要求" },
    { key: "major", label: "专业要求" },
    { key: "political", label: "政治面貌" },
    { key: "experience", label: "工作经验" },
    { key: "recruitCount", label: "招录人数" },
    { key: "examRatio", label: "开考比例" },
    { key: "matchScore", label: "匹配度" },
  ];

  const handlePositionClick = (id: number) => {
    Taro.navigateTo({ url: `/pages/positions/detail?id=${id}` });
  };

  const getValue = (position: Position, key: string) => {
    const value = position[key as keyof Position];
    if (key === "recruitCount") return `${value}人`;
    if (key === "matchScore") return `${value}%`;
    return value;
  };

  return (
    <View className="compare-page">
      <ScrollView scrollX className="compare-header">
        <View className="header-row">
          <View className="label-cell">对比项</View>
          {positions.map((position) => (
            <View
              key={position.id}
              className="position-cell"
              onClick={() => handlePositionClick(position.id)}
            >
              <Text className="position-name">{position.name}</Text>
              <Text className="view-detail">查看详情 ›</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView scrollY className="compare-body">
        {compareFields.map((field) => (
          <ScrollView key={field.key} scrollX className="compare-row">
            <View className="label-cell">{field.label}</View>
            {positions.map((position) => (
              <View
                key={position.id}
                className={`value-cell ${field.key === "matchScore" ? "highlight" : ""}`}
              >
                <Text>{getValue(position, field.key)}</Text>
              </View>
            ))}
          </ScrollView>
        ))}
      </ScrollView>

      <View className="compare-footer">
        <View className="add-btn">
          <Text>+ 添加对比职位</Text>
        </View>
      </View>
    </View>
  );
}
