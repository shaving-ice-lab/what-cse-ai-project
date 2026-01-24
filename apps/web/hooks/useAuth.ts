"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginRequest, RegisterRequest, ResetPasswordRequest } from "@/services/api/auth";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      // 只设置用户状态，不跳转
      // 跳转由调用方处理，确保状态同步后再跳转
      setUser(res.user, res.tokens.access_token, res.tokens.refresh_token);
      queryClient.clear();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (account: string) => authApi.forgotPassword(account),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      router.push("/login");
    },
  });
}
