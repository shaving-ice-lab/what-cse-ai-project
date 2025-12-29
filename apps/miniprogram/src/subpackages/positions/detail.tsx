import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import './detail.scss'

export default function DetailPage() {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)

  const position = {
    id: router.params.id,
    name: '税务局科员',
    department: '国家税务总局北京市税务局',
    location: '北京市东城区',
    education: '本科及以上',
    major: '经济学类、财政学类',
    recruitCount: 3,
    matchScore: 85,
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    Taro.showToast({ title: isFavorite ? '已取消收藏' : '收藏成功', icon: 'success' })
  }

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true })
  }

  return (
    <View className='detail-page'>
      <ScrollView scrollY className='detail-content'>
        <View className='position-header'>
          <Text className='position-name'>{position.name}</Text>
          <Text className='department'>{position.department}</Text>
          <View className='match-badge'>
            <Text className='match-score'>{position.matchScore}%</Text>
            <Text className='match-label'>匹配度</Text>
          </View>
        </View>

        <View className='info-section'>
          <Text className='section-title'>基本信息</Text>
          <View className='info-item'>
            <Text className='info-label'>工作地点</Text>
            <Text className='info-value'>{position.location}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>学历要求</Text>
            <Text className='info-value'>{position.education}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>专业要求</Text>
            <Text className='info-value'>{position.major}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>招录人数</Text>
            <Text className='info-value'>{position.recruitCount}人</Text>
          </View>
        </View>
      </ScrollView>

      <View className='detail-footer'>
        <View className='action-btn' onClick={handleFavorite}>
          <Text className={`action-icon ${isFavorite ? 'active' : ''}`}>
            {isFavorite ? '★' : '☆'}
          </Text>
          <Text>收藏</Text>
        </View>
        <View className='action-btn' onClick={handleShare}>
          <Text className='action-icon'>↗</Text>
          <Text>分享</Text>
        </View>
        <View className='apply-btn'>
          <Text>立即报考</Text>
        </View>
      </View>
    </View>
  )
}
