import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RegionData {
  code: string;
  name: string;
  children?: RegionData[];
}

export interface RegionValue {
  province?: string;
  city?: string;
  district?: string;
}

export interface RegionSelectProps {
  value?: RegionValue;
  onChange?: (value: RegionValue) => void;
  data?: RegionData[];
  label?: string;
  placeholder?: {
    province?: string;
    city?: string;
    district?: string;
  };
  disabled?: boolean;
  showDistrict?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

const defaultRegionData: RegionData[] = [
  {
    code: "110000",
    name: "北京市",
    children: [
      {
        code: "110100",
        name: "北京市",
        children: [
          { code: "110101", name: "东城区" },
          { code: "110102", name: "西城区" },
          { code: "110105", name: "朝阳区" },
          { code: "110106", name: "丰台区" },
          { code: "110107", name: "石景山区" },
          { code: "110108", name: "海淀区" },
        ],
      },
    ],
  },
  {
    code: "310000",
    name: "上海市",
    children: [
      {
        code: "310100",
        name: "上海市",
        children: [
          { code: "310101", name: "黄浦区" },
          { code: "310104", name: "徐汇区" },
          { code: "310105", name: "长宁区" },
          { code: "310106", name: "静安区" },
          { code: "310107", name: "普陀区" },
          { code: "310109", name: "虹口区" },
        ],
      },
    ],
  },
  {
    code: "330000",
    name: "浙江省",
    children: [
      {
        code: "330100",
        name: "杭州市",
        children: [
          { code: "330102", name: "上城区" },
          { code: "330103", name: "下城区" },
          { code: "330104", name: "江干区" },
          { code: "330105", name: "拱墅区" },
          { code: "330106", name: "西湖区" },
        ],
      },
      {
        code: "330200",
        name: "宁波市",
        children: [
          { code: "330203", name: "海曙区" },
          { code: "330205", name: "江北区" },
          { code: "330206", name: "北仑区" },
        ],
      },
    ],
  },
  {
    code: "440000",
    name: "广东省",
    children: [
      {
        code: "440100",
        name: "广州市",
        children: [
          { code: "440103", name: "荔湾区" },
          { code: "440104", name: "越秀区" },
          { code: "440105", name: "海珠区" },
          { code: "440106", name: "天河区" },
        ],
      },
      {
        code: "440300",
        name: "深圳市",
        children: [
          { code: "440303", name: "罗湖区" },
          { code: "440304", name: "福田区" },
          { code: "440305", name: "南山区" },
          { code: "440306", name: "宝安区" },
        ],
      },
    ],
  },
];

export function RegionSelect({
  value = {},
  onChange,
  data = defaultRegionData,
  label,
  placeholder = {
    province: "选择省份",
    city: "选择城市",
    district: "选择区县",
  },
  disabled = false,
  showDistrict = true,
  required = false,
  error,
  className,
}: RegionSelectProps) {
  const [cities, setCities] = React.useState<RegionData[]>([]);
  const [districts, setDistricts] = React.useState<RegionData[]>([]);

  React.useEffect(() => {
    if (value.province) {
      const province = data.find((p) => p.code === value.province);
      setCities(province?.children || []);
    } else {
      setCities([]);
    }
  }, [value.province, data]);

  React.useEffect(() => {
    if (value.city && cities.length > 0) {
      const city = cities.find((c) => c.code === value.city);
      setDistricts(city?.children || []);
    } else {
      setDistricts([]);
    }
  }, [value.city, cities]);

  const handleProvinceChange = (provinceCode: string) => {
    onChange?.({
      province: provinceCode,
      city: undefined,
      district: undefined,
    });
  };

  const handleCityChange = (cityCode: string) => {
    onChange?.({
      ...value,
      city: cityCode,
      district: undefined,
    });
  };

  const handleDistrictChange = (districtCode: string) => {
    onChange?.({
      ...value,
      district: districtCode,
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <div className={cn("flex gap-2", showDistrict ? "flex-col sm:flex-row" : "flex-row")}>
        <Select value={value.province} onValueChange={handleProvinceChange} disabled={disabled}>
          <SelectTrigger className={cn("flex-1", error && "border-red-500")}>
            <SelectValue placeholder={placeholder.province} />
          </SelectTrigger>
          <SelectContent>
            {data.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.city}
          onValueChange={handleCityChange}
          disabled={disabled || !value.province}
        >
          <SelectTrigger className={cn("flex-1", error && "border-red-500")}>
            <SelectValue placeholder={placeholder.city} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.code} value={city.code}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showDistrict && (
          <Select
            value={value.district}
            onValueChange={handleDistrictChange}
            disabled={disabled || !value.city}
          >
            <SelectTrigger className={cn("flex-1", error && "border-red-500")}>
              <SelectValue placeholder={placeholder.district} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default RegionSelect;
