import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

const routeLabels: Record<string, string> = {
  '/': '首页',
  '/positions': '职位列表',
  '/match': '智能匹配',
  '/announcements': '考试公告',
  '/profile': '个人中心',
  '/favorites': '我的收藏',
  '/login': '登录',
  '/register': '注册',
  '/admin': '仪表盘',
  '/admin/users': '用户管理',
  '/admin/positions': '职位管理',
  '/admin/announcements': '公告管理',
}

export function Breadcrumb({ items, showHome = true, className = '' }: BreadcrumbProps) {
  const location = useLocation()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items

    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    let currentPath = ''
    for (const path of paths) {
      currentPath += `/${path}`
      const label = routeLabels[currentPath] || path
      breadcrumbs.push({ label, path: currentPath })
    }

    return breadcrumbs
  }

  const breadcrumbItems = generateBreadcrumbs()

  if (breadcrumbItems.length === 0 && !showHome) {
    return null
  }

  return (
    <nav className={`flex items-center text-sm text-gray-500 ${className}`}>
      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
          )}
        </>
      )}
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
          )}
          {item.path && index < breadcrumbItems.length - 1 ? (
            <Link
              to={item.path}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
