import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token, res.data.refresh_token)
      queryClient.clear()
      navigate('/')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      navigate('/login')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }
}

export function useAdminLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setAdminAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: { username: string; password: string }) => 
      authApi.adminLogin(data),
    onSuccess: (res) => {
      setAdminAuth(res.data.admin, res.data.token)
      queryClient.clear()
      navigate('/admin')
    },
  })
}
