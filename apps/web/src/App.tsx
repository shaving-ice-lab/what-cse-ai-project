import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Loading from '@/components/common/Loading'

import UserLayout from '@/layouts/UserLayout'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'

const HomePage = lazy(() => import('@/pages/user/HomePage'))
const PositionListPage = lazy(() => import('@/pages/user/PositionListPage'))
const PositionDetailPage = lazy(() => import('@/pages/user/PositionDetailPage'))
const MatchPage = lazy(() => import('@/pages/user/MatchPage'))
const AnnouncementListPage = lazy(() => import('@/pages/user/AnnouncementListPage'))
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'))
const FavoritesPage = lazy(() => import('@/pages/user/FavoritesPage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminPositions = lazy(() => import('@/pages/admin/Positions'))
const AdminAnnouncements = lazy(() => import('@/pages/admin/Announcements'))
const AdminLogin = lazy(() => import('@/pages/admin/Login'))

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

import { useAuthStore } from '@/stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAuthStore()
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <>
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/positions" element={<PositionListPage />} />
            <Route path="/positions/:id" element={<PositionDetailPage />} />
            <Route path="/announcements" element={<AnnouncementListPage />} />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <MatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="positions" element={<AdminPositions />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  )
}

export default App
