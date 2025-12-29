import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './profile.scss'

interface ProfileData {
  name: string
  gender: string
  birthDate: string
  education: string
  degree: string
  major: string
  political: string
  workYears: string
  phone: string
  email: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '张三',
    gender: '男',
    birthDate: '1995-06-15',
    education: '本科',
    degree: '学士',
    major: '计算机科学与技术',
    political: '中共党员',
    workYears: '3年',
    phone: '138****8888',
    email: 'zhangsan@email.com',
  })

  const genderOptions = ['男', '女']
  const educationOptions = ['大专', '本科', '硕士', '博士']
  const degreeOptions = ['无学位', '学士', '硕士', '博士']
  const politicalOptions = ['群众', '共青团员', '中共党员', '民主党派']
  const workYearsOptions = ['应届毕业生', '1年', '2年', '3年', '5年', '5年以上']

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  const handleSave = () => {
    Taro.showLoading({ title: '保存中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '保存成功', icon: 'success' })
    }, 500)
  }

  const getCompleteness = () => {
    const filled = Object.values(profile).filter(v => v).length
    return Math.round((filled / Object.keys(profile).length) * 100)
  }

  return (
    <View className='profile-page'>
      <View className='profile-header'>
        <View className='completeness'>
          <Text className='completeness-value'>{getCompleteness()}%</Text>
          <Text className='completeness-label'>简历完整度</Text>
        </View>
        <View className='progress-bar'>
          <View className='progress-fill' style={{ width: `${getCompleteness()}%` }} />
        </View>
      </View>

      <View className='form-section'>
        <Text className='section-title'>基本信息</Text>
        
        <View className='form-item'>
          <Text className='form-label'>姓名</Text>
          <Input
            className='form-input'
            value={profile.name}
            placeholder='请输入姓名'
            onInput={(e) => handleFieldChange('name', e.detail.value)}
          />
        </View>

        <Picker
          mode='selector'
          range={genderOptions}
          onChange={(e) => handleFieldChange('gender', genderOptions[e.detail.value as number])}
        >
          <View className='form-item'>
            <Text className='form-label'>性别</Text>
            <Text className='form-value'>{profile.gender || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>

        <Picker
          mode='date'
          value={profile.birthDate}
          onChange={(e) => handleFieldChange('birthDate', e.detail.value)}
        >
          <View className='form-item'>
            <Text className='form-label'>出生日期</Text>
            <Text className='form-value'>{profile.birthDate || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={politicalOptions}
          onChange={(e) => handleFieldChange('political', politicalOptions[e.detail.value as number])}
        >
          <View className='form-item'>
            <Text className='form-label'>政治面貌</Text>
            <Text className='form-value'>{profile.political || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>
      </View>

      <View className='form-section'>
        <Text className='section-title'>学历信息</Text>

        <Picker
          mode='selector'
          range={educationOptions}
          onChange={(e) => handleFieldChange('education', educationOptions[e.detail.value as number])}
        >
          <View className='form-item'>
            <Text className='form-label'>最高学历</Text>
            <Text className='form-value'>{profile.education || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={degreeOptions}
          onChange={(e) => handleFieldChange('degree', degreeOptions[e.detail.value as number])}
        >
          <View className='form-item'>
            <Text className='form-label'>学位</Text>
            <Text className='form-value'>{profile.degree || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>

        <View className='form-item'>
          <Text className='form-label'>所学专业</Text>
          <Input
            className='form-input'
            value={profile.major}
            placeholder='请输入专业'
            onInput={(e) => handleFieldChange('major', e.detail.value)}
          />
        </View>
      </View>

      <View className='form-section'>
        <Text className='section-title'>工作经验</Text>

        <Picker
          mode='selector'
          range={workYearsOptions}
          onChange={(e) => handleFieldChange('workYears', workYearsOptions[e.detail.value as number])}
        >
          <View className='form-item'>
            <Text className='form-label'>工作年限</Text>
            <Text className='form-value'>{profile.workYears || '请选择'}</Text>
            <Text className='form-arrow'>›</Text>
          </View>
        </Picker>
      </View>

      <View className='form-section'>
        <Text className='section-title'>联系方式</Text>

        <View className='form-item'>
          <Text className='form-label'>手机号</Text>
          <Input
            className='form-input'
            type='number'
            value={profile.phone}
            placeholder='请输入手机号'
            maxlength={11}
            onInput={(e) => handleFieldChange('phone', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>邮箱</Text>
          <Input
            className='form-input'
            value={profile.email}
            placeholder='请输入邮箱'
            onInput={(e) => handleFieldChange('email', e.detail.value)}
          />
        </View>
      </View>

      <View className='save-btn' onClick={handleSave}>
        <Text>保存</Text>
      </View>
    </View>
  )
}
