// 考试类型
export const EXAM_TYPES = [
  { label: '国家公务员', value: '国考' },
  { label: '地方公务员', value: '省考' },
  { label: '事业单位', value: '事业单位' },
  { label: '选调生', value: '选调生' },
]

// 学历要求
export const EDUCATION_LEVELS = [
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士研究生', value: '硕士研究生' },
  { label: '博士研究生', value: '博士研究生' },
]

// 政治面貌
export const POLITICAL_STATUS = [
  { label: '不限', value: '不限' },
  { label: '中共党员', value: '中共党员' },
  { label: '中共党员或共青团员', value: '中共党员或共青团员' },
  { label: '群众', value: '群众' },
]

// 工作经验
export const WORK_EXPERIENCE = [
  { label: '不限', value: '不限' },
  { label: '无基层工作经历', value: '无基层工作经历' },
  { label: '一年以上', value: '一年以上' },
  { label: '两年以上', value: '两年以上' },
  { label: '三年以上', value: '三年以上' },
  { label: '五年以上', value: '五年以上' },
]

// 省份列表
export const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
]

// 匹配度等级
export const MATCH_LEVELS = [
  { min: 90, label: '完美匹配', color: 'success' },
  { min: 70, label: '高度匹配', color: 'primary' },
  { min: 50, label: '部分匹配', color: 'warning' },
  { min: 0, label: '匹配度低', color: 'error' },
]

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POSITIONS: '/positions',
  POSITION_DETAIL: '/positions/:id',
  MATCH: '/match',
  ANNOUNCEMENTS: '/announcements',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  NOTIFICATIONS: '/notifications',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_POSITIONS: '/admin/positions',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
}

// API 端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ADMIN_LOGIN: '/admin/login',
  },
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
  },
  POSITION: {
    LIST: '/positions',
    DETAIL: '/positions/:id',
    COMPARE: '/positions/compare',
  },
  FAVORITE: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: '/favorites/:id',
  },
  MATCH: {
    RESULTS: '/match/results',
    REPORT: '/match/report',
  },
  ANNOUNCEMENT: {
    LIST: '/announcements',
    DETAIL: '/announcements/:id',
  },
  NOTIFICATION: {
    LIST: '/notifications',
    READ: '/notifications/:id/read',
    READ_ALL: '/notifications/read-all',
  },
}
