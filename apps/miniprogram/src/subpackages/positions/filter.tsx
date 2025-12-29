import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './filter.scss'

export default function FilterPage() {
  const [filters, setFilters] = useState({
    examType: '',
    region: '',
    education: '',
  })

  const filterOptions = {
    examType: ['全部', '国考', '省考', '事业编'],
    region: ['全部', '北京', '上海', '广东', '江苏'],
    education: ['全部', '本科', '硕士', '博士'],
  }

  const handleConfirm = () => {
    Taro.navigateTo({ url: '/subpackages/positions/index' })
  }

  return (
    <View className='filter-page'>
      <ScrollView scrollY className='filter-content'>
        <View className='filter-section'>
          <Text className='section-title'>考试类型</Text>
          <View className='option-list'>
            {filterOptions.examType.map((opt) => (
              <Text
                key={opt}
                className={`option-item ${filters.examType === opt ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, examType: opt })}
              >
                {opt}
              </Text>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='section-title'>地区</Text>
          <View className='option-list'>
            {filterOptions.region.map((opt) => (
              <Text
                key={opt}
                className={`option-item ${filters.region === opt ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, region: opt })}
              >
                {opt}
              </Text>
            ))}
          </View>
        </View>

        <View className='filter-section'>
          <Text className='section-title'>学历</Text>
          <View className='option-list'>
            {filterOptions.education.map((opt) => (
              <Text
                key={opt}
                className={`option-item ${filters.education === opt ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, education: opt })}
              >
                {opt}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className='filter-footer'>
        <View className='reset-btn' onClick={() => setFilters({ examType: '', region: '', education: '' })}>
          重置
        </View>
        <View className='confirm-btn' onClick={handleConfirm}>
          确定
        </View>
      </View>
    </View>
  )
}
