import { View, Text, ScrollView } from "@tarojs/components";
import "./index.scss";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, activeFilter, onChange }) => {
  return (
    <View className="filter-bar">
      <ScrollView className="filter-bar__scroll" scrollX>
        <View className="filter-bar__list">
          {filters.map((filter) => (
            <View
              key={filter.value}
              className={`filter-bar__item ${activeFilter === filter.value ? "filter-bar__item--active" : ""}`}
              onClick={() => onChange(filter.value)}
            >
              <Text>{filter.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FilterBar;
