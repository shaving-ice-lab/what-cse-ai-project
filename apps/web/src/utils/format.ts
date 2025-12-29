import dayjs from 'dayjs'

export function formatDate(date: string | Date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatRelativeTime(date: string | Date) {
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return formatDate(date)
}

export function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

export function formatCompetitionRatio(applicants: number, recruitCount: number) {
  if (!recruitCount) return '-'
  const ratio = Math.round(applicants / recruitCount)
  return `${ratio}:1`
}

export function formatSalary(min: number, max: number) {
  if (!min && !max) return '面议'
  if (!max) return `${min}K以上`
  if (!min) return `${max}K以下`
  return `${min}K-${max}K`
}
