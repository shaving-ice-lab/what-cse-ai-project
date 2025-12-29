import { View, Text, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './filter.scss'

interface FilterState {
  examType: string
  region: string
  education: string
  major: string
  experience: string
  recruitCount: string
}

export default function PositionFilterPage() {
  const [filters, setFilters] = useState<FilterState>({
    examType: '',
    region: '',
    education: '',
    major: '',
    experience: '',
    recruitCount: '',
  })

  const filterOptions = {
    examType: ['全部', '国考', '省考', '事业编', '选调生'],
    region: ['全部', '北京', '上海', '广东', '江苏', '浙江', '四川', '湖北'],
    education: ['全部', '本科', '硕士', '博士', '大专及以上'],
    major: ['全部', '不限专业', '法学类', '经济学类', '管理学类', '计算机类', '中文类'],
    experience: ['全部', '不限', '应届生', '2年及以上', '5年及以上'],
    recruitCount: ['全部', '1人', '2-5人', '5人以上'],
  }

  const filterLabels = {
    examType: '考试类型',
    region: '工作地区',
    education: '学历要求',
    major: '专业要求',
    experience: '工作经验',
    recruitCount: '招录人数',
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleReset = () => {
    setFilters({
      examType: '',
      region: '',
      education: '',
      major: '',
      experience: '',
      recruitCount: '',
    })
  }

  const handleConfirm = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '全部') {
        params.append(key, value)
      }
    })
    Taro.navigateTo({
      url: `/pages/positions/index?${params.toString()}`
    })
  }

  const getActiveCount = () => {
    return Object.values(filters).filter(v => v && v !== '全部').length
  }

  return (
    <View className='filter-page'>
      <ScrollView scrollY className='filter-content'>
        {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((key) => (
          <View key={key} className='filter-section'>
            <Text className='filter-label'>{filterLabels[key]}</Text>
            <View className='option-list'>
              {filterOptions[key].map((option) => (
                <Text
                  key={option}
                  className={`option-item ${filters[key] === option ? 'active' : ''}`}
                  onClick={() => handleFilterChange(key, option)}
                >
                  {option}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View className='filter-footer'>
        <View className='reset-btn' onClick={handleReset}>
          <Text>重置</Text>
        </View>
        <View className='confirm-btn' onClick={handleConfirm}>
          <Text>确定 {getActiveCount() > 0 && `(${getActiveCount()})`}</Text>
        </View>
      </View>
    </View>
  )
}
