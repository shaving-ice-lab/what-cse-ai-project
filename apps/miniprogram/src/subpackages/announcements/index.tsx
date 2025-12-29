import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function AnnouncementsPage() {
  const announcements = [
    { id: 1, title: '2024年国家公务员考试公告', date: '2024-10-15', type: '国考' },
    { id: 2, title: '2024年北京市公务员考试公告', date: '2024-11-01', type: '省考' },
    { id: 3, title: '中央机关及其直属机构考录公告', date: '2024-10-14', type: '国考' },
  ]

  return (
    <View className='announcements-page'>
      <View className='announcement-list'>
        {announcements.map((item) => (
          <View
            key={item.id}
            className='announcement-card'
            onClick={() => Taro.navigateTo({ url: `/subpackages/announcements/detail?id=${item.id}` })}
          >
            <View className='card-header'>
              <Text className='type-tag'>{item.type}</Text>
              <Text className='date'>{item.date}</Text>
            </View>
            <Text className='title'>{item.title}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
