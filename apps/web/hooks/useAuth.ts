"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authApi,
  adminAuthApi,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/services/api/auth";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setUser(res.user, res.tokens.access_token, res.tokens.refresh_token);
      queryClient.clear();
      router.push("/");
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

export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAdmin } = useAuthStore();

  return useMutation({
    mutationFn: (data: { username: string; password: string }) => adminAuthApi.login(data),
    onSuccess: (res) => {
      setAdmin(res.admin, res.access_token);
      queryClient.clear();
      router.push("/admin");
    },
  });
}
