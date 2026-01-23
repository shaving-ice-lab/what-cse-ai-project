import { View, Text, Input, Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./profile.scss";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "张三",
    education: "本科",
    major: "计算机科学与技术",
    political: "中共党员",
    workYears: "3年",
  });

  const educationOptions = ["大专", "本科", "硕士", "博士"];
  const politicalOptions = ["群众", "共青团员", "中共党员", "民主党派"];
  const workYearsOptions = ["应届毕业生", "1年", "2年", "3年", "5年", "5年以上"];

  const handleSave = () => {
    Taro.showLoading({ title: "保存中..." });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: "保存成功", icon: "success" });
    }, 500);
  };

  return (
    <View className="profile-page">
      <View className="form-section">
        <View className="form-item">
          <Text className="form-label">姓名</Text>
          <Input
            className="form-input"
            value={profile.name}
            placeholder="请输入姓名"
            onInput={(e) => setProfile({ ...profile, name: e.detail.value })}
          />
        </View>

        <Picker
          mode="selector"
          range={educationOptions}
          onChange={(e) =>
            setProfile({ ...profile, education: educationOptions[e.detail.value as number] })
          }
        >
          <View className="form-item">
            <Text className="form-label">学历</Text>
            <Text className="form-value">{profile.education || "请选择"}</Text>
            <Text className="form-arrow">›</Text>
          </View>
        </Picker>

        <View className="form-item">
          <Text className="form-label">专业</Text>
          <Input
            className="form-input"
            value={profile.major}
            placeholder="请输入专业"
            onInput={(e) => setProfile({ ...profile, major: e.detail.value })}
          />
        </View>

        <Picker
          mode="selector"
          range={politicalOptions}
          onChange={(e) =>
            setProfile({ ...profile, political: politicalOptions[e.detail.value as number] })
          }
        >
          <View className="form-item">
            <Text className="form-label">政治面貌</Text>
            <Text className="form-value">{profile.political || "请选择"}</Text>
            <Text className="form-arrow">›</Text>
          </View>
        </Picker>

        <Picker
          mode="selector"
          range={workYearsOptions}
          onChange={(e) =>
            setProfile({ ...profile, workYears: workYearsOptions[e.detail.value as number] })
          }
        >
          <View className="form-item">
            <Text className="form-label">工作年限</Text>
            <Text className="form-value">{profile.workYears || "请选择"}</Text>
            <Text className="form-arrow">›</Text>
          </View>
        </Picker>
      </View>

      <View className="save-btn" onClick={handleSave}>
        <Text>保存</Text>
      </View>
    </View>
  );
}
