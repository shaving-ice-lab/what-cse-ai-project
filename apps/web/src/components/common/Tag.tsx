import { ReactNode } from 'react'

type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

interface TagProps {
  children: ReactNode
  color?: TagColor
  size?: 'sm' | 'md'
  className?: string
}

const colorMap: Record<TagColor, string> = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-cyan-100 text-cyan-600',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Tag({
  children,
  color = 'default',
  size = 'sm',
  className = '',
}: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${colorMap[color]}
        ${sizeMap[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
