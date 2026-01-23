import { View, Text, ScrollView } from "@tarojs/components";
import { useState } from "react";
import "./index.scss";

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onConfirm: () => void;
  onReset: () => void;
}

export default function FilterPanel({
  filters,
  values,
  onChange,
  onConfirm,
  onReset,
}: FilterPanelProps) {
  const [activeFilter, setActiveFilter] = useState(filters[0]?.key || "");

  const handleOptionClick = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const activeOptions = filters.find((f) => f.key === activeFilter)?.options || [];

  return (
    <View className="filter-panel">
      <View className="filter-tabs">
        <ScrollView scrollY className="tabs-list">
          {filters.map((filter) => (
            <View
              key={filter.key}
              className={`tab-item ${activeFilter === filter.key ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              <Text>{filter.label}</Text>
              {values[filter.key] && <Text className="selected-dot" />}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="filter-options">
        <ScrollView scrollY className="options-list">
          {activeOptions.map((opt) => (
            <View
              key={opt.value}
              className={`option-item ${values[activeFilter] === opt.value ? "active" : ""}`}
              onClick={() => handleOptionClick(activeFilter, opt.value)}
            >
              <Text>{opt.label}</Text>
              {values[activeFilter] === opt.value && <Text className="check-icon">✓</Text>}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="filter-footer">
        <View className="reset-btn" onClick={onReset}>
          <Text>重置</Text>
        </View>
        <View className="confirm-btn" onClick={onConfirm}>
          <Text>确定</Text>
        </View>
      </View>
    </View>
  );
}
