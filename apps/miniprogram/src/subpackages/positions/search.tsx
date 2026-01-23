import { View, Text, Input } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useState } from "react";
import "./search.scss";

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState(router.params.keyword || "");
  const [history] = useState(["税务局", "海关", "统计局"]);

  const handleSearch = () => {
    if (keyword.trim()) {
      Taro.navigateTo({ url: `/subpackages/positions/index?keyword=${keyword}` });
    }
  };

  return (
    <View className="search-page">
      <View className="search-header">
        <View className="search-box">
          <Input
            className="search-input"
            placeholder="搜索职位、单位"
            value={keyword}
            focus
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
        <Text className="search-btn" onClick={handleSearch}>
          搜索
        </Text>
      </View>

      <View className="history-section">
        <Text className="section-title">搜索历史</Text>
        <View className="history-list">
          {history.map((item, index) => (
            <Text key={index} className="history-tag" onClick={() => setKeyword(item)}>
              {item}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
