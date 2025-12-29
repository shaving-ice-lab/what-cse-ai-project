import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './login.scss'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'phone' | 'password'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [agreed, setAgreed] = useState(false)

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
  }

  const handleLogin = () => {
    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' })
      return
    }
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (loginType === 'phone' && !code) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    if (loginType === 'password' && !password) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    
    Taro.showLoading({ title: '登录中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/user/index' })
      }, 1500)
    }, 1000)
  }

  const handleWechatLogin = () => {
    Taro.showLoading({ title: '微信登录中...' })
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }, 500)
  }

  return (
    <View className='login-page'>
      <View className='login-header'>
        <Text className='title'>欢迎登录</Text>
        <Text className='subtitle'>公考智能筛选系统</Text>
      </View>

      <View className='login-tabs'>
        <Text
          className={`tab ${loginType === 'phone' ? 'active' : ''}`}
          onClick={() => setLoginType('phone')}
        >
          验证码登录
        </Text>
        <Text
          className={`tab ${loginType === 'password' ? 'active' : ''}`}
          onClick={() => setLoginType('password')}
        >
          密码登录
        </Text>
      </View>

      <View className='login-form'>
        <View className='form-item'>
          <Text className='prefix'>+86</Text>
          <Input
            className='input'
            type='number'
            placeholder='请输入手机号'
            maxlength={11}
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>

        {loginType === 'phone' ? (
          <View className='form-item'>
            <Input
              className='input'
              type='number'
              placeholder='请输入验证码'
              maxlength={6}
              value={code}
              onInput={(e) => setCode(e.detail.value)}
            />
            <Text
              className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
              onClick={countdown > 0 ? undefined : handleSendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Text>
          </View>
        ) : (
          <View className='form-item'>
            <Input
              className='input'
              type='text'
              password
              placeholder='请输入密码'
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>
        )}

        <View className='agreement'>
          <View
            className={`checkbox ${agreed ? 'checked' : ''}`}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && '✓'}
          </View>
          <Text className='agreement-text'>
            我已阅读并同意
            <Text className='link'>《用户协议》</Text>
            和
            <Text className='link'>《隐私政策》</Text>
          </Text>
        </View>

        <View className='login-btn' onClick={handleLogin}>
          <Text>登录</Text>
        </View>

        <View className='other-login'>
          <View className='divider'>
            <Text className='divider-text'>其他登录方式</Text>
          </View>
          <View className='wechat-btn' onClick={handleWechatLogin}>
            <Text className='wechat-icon'>微</Text>
            <Text>微信登录</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
