"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Search,
  Phone,
  Navigation,
  Building2,
  ChevronRight,
  Loader2,
  Info,
  ExternalLink,
  Map
} from "lucide-react";
import { toolsApi, ExamLocation, ExamLocationQueryParams } from "@/services/api";

export default function ExamLocationsPage() {
  const [locations, setLocations] = useState<ExamLocation[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ExamLocation | null>(null);

  const [filters, setFilters] = useState<ExamLocationQueryParams>({
    province: "",
    city: "",
    exam_type: "",
    keyword: "",
    page: 1,
    page_size: 12,
  });

  const examTypes = [
    { value: "", label: "全部类型" },
    { value: "国考", label: "国考" },
    { value: "省考", label: "省考" },
    { value: "事业单位", label: "事业单位" },
    { value: "教师招聘", label: "教师招聘" },
  ];

  // 获取省份列表
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await toolsApi.locations.getProvinces();
        setProvinces(data || []);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 获取城市列表
  useEffect(() => {
    if (filters.province) {
      const fetchCities = async () => {
        try {
          const data = await toolsApi.locations.getCities(filters.province!);
          setCities(data || []);
        } catch (error) {
          console.error("Failed to fetch cities:", error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [filters.province]);

  // 获取考点列表
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await toolsApi.locations.list(filters);
        setLocations(response.locations || []);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [filters]);

  const handleFilterChange = (key: keyof ExamLocationQueryParams, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
      ...(key === "province" ? { city: "" } : {}),
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const openMap = (location: ExamLocation) => {
    // 打开高德地图
    const url = `https://uri.amap.com/marker?position=${location.longitude},${location.latitude}&name=${encodeURIComponent(location.name)}&src=gongkaozx&coordinate=gaode&callnative=0`;
    window.open(url, "_blank");
  };

  const totalPages = Math.ceil(total / (filters.page_size || 12));

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
            <a href="/tools" className="hover:text-white">考试工具箱</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">考点查询</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">考点查询</h1>
              <p className="text-blue-100 mt-1">查询全国各地考试考点信息</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 lg:p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 省份选择 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">省份</label>
                <select
                  value={filters.province}
                  onChange={(e) => handleFilterChange("province", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">全部省份</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* 城市选择 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">城市</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  disabled={!filters.province}
                >
                  <option value="">全部城市</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* 考试类型 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">考试类型</label>
                <select
                  value={filters.exam_type}
                  onChange={(e) => handleFilterChange("exam_type", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  {examTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* 关键词搜索 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">搜索</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange("keyword", e.target.value)}
                    placeholder="考点名称/地址"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-stone-600">
            共找到 <span className="font-semibold text-stone-900">{total}</span> 个考点
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">暂无考点数据</p>
            <p className="text-sm text-stone-400 mt-1">请尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-stone-800 truncate">
                        {location.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md">
                          {location.exam_type || "综合"}
                        </span>
                        <span className="text-xs text-stone-400">
                          {location.province} {location.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-stone-600 mb-3">
                    <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{location.address}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    {location.contact_phone && (
                      <a
                        href={`tel:${location.contact_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>电话</span>
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMap(location);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>导航</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handleFilterChange("page", Math.max(1, (filters.page || 1) - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm rounded-lg border border-stone-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-stone-600">
              {filters.page} / {totalPages}
            </span>
            <button
              onClick={() => handleFilterChange("page", Math.min(totalPages, (filters.page || 1) + 1))}
              disabled={filters.page === totalPages}
              className="px-4 py-2 text-sm rounded-lg border border-stone-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedLocation(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">{selectedLocation.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md">
                      {selectedLocation.exam_type || "综合"}
                    </span>
                    <span className="text-sm text-stone-500">
                      {selectedLocation.province} {selectedLocation.city} {selectedLocation.district}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Address */}
                <div className="p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    详细地址
                  </div>
                  <p className="text-sm text-stone-600">{selectedLocation.address}</p>
                </div>

                {/* Contact */}
                {selectedLocation.contact_phone && (
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                      <Phone className="w-4 h-4" />
                      联系电话
                    </div>
                    <a href={`tel:${selectedLocation.contact_phone}`} className="text-sm text-blue-600">
                      {selectedLocation.contact_phone}
                    </a>
                  </div>
                )}

                {/* Description */}
                {selectedLocation.description && (
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                      <Info className="w-4 h-4" />
                      考点说明
                    </div>
                    <p className="text-sm text-stone-600">{selectedLocation.description}</p>
                  </div>
                )}

                {/* Facilities */}
                {selectedLocation.facilities && (
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                      <Building2 className="w-4 h-4" />
                      周边设施
                    </div>
                    <p className="text-sm text-stone-600">{selectedLocation.facilities}</p>
                  </div>
                )}

                {/* Capacity */}
                {selectedLocation.capacity && selectedLocation.capacity > 0 && (
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                    <span className="text-sm text-stone-700">可容纳人数</span>
                    <span className="text-sm font-semibold text-stone-900">{selectedLocation.capacity} 人</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => openMap(selectedLocation)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Map className="w-5 h-5" />
                  打开地图导航
                </button>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="px-6 py-3 text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
