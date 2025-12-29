import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, UpdateProfileParams, UserProfile } from '@/services/api/user'

export function useUser() {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileParams) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => userApi.updateAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      userApi.changePassword(data),
  })

  return {
    profile: profileQuery.data?.data as UserProfile | undefined,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    refetch: profileQuery.refetch,

    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,

    updateAvatar: updateAvatarMutation.mutate,
    isUploadingAvatar: updateAvatarMutation.isPending,

    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
  }
}
