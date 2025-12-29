import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Loading from "@/components/common/Loading";

import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

const HomePage = lazy(() => import("@/pages/user/HomePage"));
const PositionListPage = lazy(() => import("@/pages/user/PositionListPage"));
const PositionDetailPage = lazy(() => import("@/pages/user/PositionDetailPage"));
const MatchPage = lazy(() => import("@/pages/user/MatchPage"));
const AnnouncementListPage = lazy(() => import("@/pages/user/AnnouncementListPage"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/user/FavoritesPage"));
const PreferencesPage = lazy(() => import("@/pages/user/PreferencesPage"));
const NotificationsPage = lazy(() => import("@/pages/user/NotificationsPage"));
const SecurityPage = lazy(() => import("@/pages/user/SecurityPage"));
const HistoryPage = lazy(() => import("@/pages/user/HistoryPage"));
const MatchReportPage = lazy(() => import("@/pages/user/MatchReportPage"));

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminPositions = lazy(() => import("@/pages/admin/Positions"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/Announcements"));
const AdminUserDetail = lazy(() => import("@/pages/admin/UserDetail"));
const AdminPositionDetail = lazy(() => import("@/pages/admin/PositionDetail"));
const AdminPendingPositions = lazy(() => import("@/pages/admin/PendingPositions"));
const AdminAnnouncementCreate = lazy(() => import("@/pages/admin/AnnouncementCreate"));
const AdminAnnouncementEdit = lazy(() => import("@/pages/admin/AnnouncementEdit"));
const AdminCrawlers = lazy(() => import("@/pages/admin/Crawlers"));
const AdminListPages = lazy(() => import("@/pages/admin/ListPages"));
const AdminDictionaryMajors = lazy(() => import("@/pages/admin/DictionaryMajors"));
const AdminDictionaryRegions = lazy(() => import("@/pages/admin/DictionaryRegions"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminAdmins = lazy(() => import("@/pages/admin/Admins"));
const AdminLogs = lazy(() => import("@/pages/admin/Logs"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

import { useAuthStore } from "@/stores/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAuthStore();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <PreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/report"
              element={
                <ProtectedRoute>
                  <MatchReportPage />
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
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="positions" element={<AdminPositions />} />
            <Route path="positions/pending" element={<AdminPendingPositions />} />
            <Route path="positions/:id" element={<AdminPositionDetail />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="announcements/create" element={<AdminAnnouncementCreate />} />
            <Route path="announcements/:id/edit" element={<AdminAnnouncementEdit />} />
            <Route path="crawlers" element={<AdminCrawlers />} />
            <Route path="list-pages" element={<AdminListPages />} />
            <Route path="dictionary/majors" element={<AdminDictionaryMajors />} />
            <Route path="dictionary/regions" element={<AdminDictionaryRegions />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/admins" element={<AdminAdmins />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
