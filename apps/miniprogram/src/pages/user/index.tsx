import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function UserPage() {
  const isLoggedIn = true
  const userInfo = {
    nickname: '张三',
    avatar: '',
    profileComplete: 75,
  }

  const menuList = [
    { icon: '📝', label: '我的简历', path: '/pages/user/profile' },
    { icon: '⭐', label: '我的收藏', path: '/pages/user/favorites' },
    { icon: '📊', label: '匹配报告', path: '/subpackages/match/report' },
    { icon: '🔔', label: '消息通知', path: '/pages/user/notifications' },
    { icon: '⚙️', label: '设置', path: '/pages/user/settings' },
  ]

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/user/login' })
  }

  return (
    <View className='user-page'>
      <View className='user-header'>
        {isLoggedIn ? (
          <View className='user-info'>
            <View className='avatar-wrapper'>
              {userInfo.avatar ? (
                <Image className='avatar' src={userInfo.avatar} />
              ) : (
                <View className='avatar-placeholder'>{userInfo.nickname.slice(0, 1)}</View>
              )}
            </View>
            <Text className='nickname'>{userInfo.nickname}</Text>
            <View className='profile-progress'>
              <Text>简历完整度 {userInfo.profileComplete}%</Text>
              <View className='progress-bar'>
                <View className='progress-fill' style={{ width: `${userInfo.profileComplete}%` }} />
              </View>
            </View>
          </View>
        ) : (
          <View className='login-prompt' onClick={handleLogin}>
            <View className='avatar-placeholder'>?</View>
            <Text className='login-text'>点击登录</Text>
          </View>
        )}
      </View>

      <View className='menu-list'>
        {menuList.map((item, index) => (
          <View
            key={index}
            className='menu-item'
            onClick={() => Taro.navigateTo({ url: item.path })}
          >
            <Text className='menu-icon'>{item.icon}</Text>
            <Text className='menu-label'>{item.label}</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
