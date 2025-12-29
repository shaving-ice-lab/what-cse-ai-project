import { useParams, Link } from 'react-router-dom'
import { Heart, Share2, ArrowLeft, Check, X, AlertCircle } from 'lucide-react'

export default function PositionDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/positions" className="inline-flex items-center text-gray-600 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回列表
      </Link>

      {/* Position Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">科员（一）</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded">国考</span>
            </div>
            <p className="text-lg text-gray-600">国家税务总局北京市税务局</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Heart className="w-5 h-5" />
              <span>收藏</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Share2 className="w-5 h-5" />
              <span>分享</span>
            </button>
          </div>
        </div>

        {/* Match Score */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">85%</span>
              </div>
              <div>
                <p className="font-semibold text-green-800">匹配度高</p>
                <p className="text-sm text-green-600">符合您的大部分条件</p>
              </div>
            </div>
            <Link to="/match" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              查看详细分析
            </Link>
          </div>
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">招录人数</p>
                <p className="font-semibold text-gray-800">3人</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">报名人数</p>
                <p className="font-semibold text-gray-800">360人</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">竞争比</p>
                <p className="font-semibold text-orange-500">120:1</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">工作地点</p>
                <p className="font-semibold text-gray-800">北京市朝阳区</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">报考条件</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">学历要求</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">本科及以上</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">专业要求</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">会计学、财务管理</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">政治面貌</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">中共党员</span>
                  <X className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">年龄要求</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">18-35周岁</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">工作经验</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">不限</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">注意事项</p>
                <p className="text-sm text-yellow-700 mt-1">
                  该职位要求中共党员身份，请确认您符合此条件后再报考。
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">考试日程</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-800">报名时间</p>
                  <p className="text-sm text-gray-500">2024-10-15 ~ 2024-10-24</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-800">笔试时间</p>
                  <p className="text-sm text-gray-500">2024-11-26</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-800">成绩查询</p>
                  <p className="text-sm text-gray-500">待定</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
