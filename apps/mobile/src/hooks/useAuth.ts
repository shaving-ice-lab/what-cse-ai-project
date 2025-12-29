import { useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '../stores'
import { authService } from '../services'

export function useAuth() {
  const { token, user, isLoggedIn, setToken, setUser, logout } = useAuthStore()

  const login = useCallback(async (phone: string, password: string) => {
    try {
      Taro.showLoading({ title: '登录中...' })
      const result = await authService.login(phone, password)
      if (result.token) {
        setToken(result.token)
        setUser(result.user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        return true
      }
      return false
    } catch (error: any) {
      Taro.showToast({ title: error.message || '登录失败', icon: 'none' })
      return false
    } finally {
      Taro.hideLoading()
    }
  }, [setToken, setUser])

  const wxLogin = useCallback(async () => {
    try {
      const { code } = await Taro.login()
      Taro.showLoading({ title: '登录中...' })
      const result = await authService.wxLogin(code)
      if (result.token) {
        setToken(result.token)
        setUser(result.user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        return true
      }
      return false
    } catch (error: any) {
      Taro.showToast({ title: error.message || '登录失败', icon: 'none' })
      return false
    } finally {
      Taro.hideLoading()
    }
  }, [setToken, setUser])

  const handleLogout = useCallback(() => {
    logout()
    Taro.showToast({ title: '已退出登录', icon: 'success' })
    Taro.switchTab({ url: '/pages/index/index' })
  }, [logout])

  return {
    token,
    user,
    isLoggedIn,
    login,
    wxLogin,
    logout: handleLogout,
  }
}
