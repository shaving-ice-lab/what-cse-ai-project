import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './notifications.scss'

interface Notification {
  id: number
  type: 'system' | 'position' | 'exam'
  title: string
  content: string
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'exam', title: '国考报名提醒', content: '2024年国家公务员考试报名将于10月15日开始，请提前准备相关材料。', time: '2小时前', read: false },
    { id: 2, type: 'position', title: '新职位匹配', content: '根据您的简历信息，新发现5个高度匹配的职位，点击查看详情。', time: '昨天', read: false },
    { id: 3, type: 'system', title: '系统更新', content: '公考智能筛选系统已更新至最新版本，新增职位对比功能。', time: '3天前', read: true },
    { id: 4, type: 'exam', title: '省考时间确定', content: '2024年各省省考联考时间已确定，请关注您意向省份的报名时间。', time: '1周前', read: true },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return '📅'
      case 'position': return '💼'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ))
    }
    
    if (notification.type === 'position') {
      Taro.switchTab({ url: '/pages/match/index' })
    }
  }

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <View className='notifications-page'>
      <View className='page-header'>
        <Text className='unread-count'>{unreadCount} 条未读</Text>
        {unreadCount > 0 && (
          <Text className='mark-all' onClick={handleMarkAllRead}>全部已读</Text>
        )}
      </View>

      <View className='notification-list'>
        {notifications.map((notification) => (
          <View
            key={notification.id}
            className={`notification-card ${notification.read ? 'read' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <View className='notification-icon'>
              <Text>{getTypeIcon(notification.type)}</Text>
            </View>
            <View className='notification-content'>
              <View className='notification-header'>
                <Text className='notification-title'>{notification.title}</Text>
                {!notification.read && <View className='unread-dot' />}
              </View>
              <Text className='notification-text'>{notification.content}</Text>
              <Text className='notification-time'>{notification.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
