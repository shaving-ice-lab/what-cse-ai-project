import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Target, TrendingUp, AlertCircle, ChevronRight, RefreshCw, Filter } from 'lucide-react'

interface MatchResult {
  id: number
  position_name: string
  department_name: string
  work_location: string
  total_score: number
  hard_score: number
  soft_score: number
  match_details: {
    name: string
    is_match: boolean
    user_value: string
    position_value: string
  }[]
}

const mockResults: MatchResult[] = [
  {
    id: 1,
    position_name: '综合管理岗',
    department_name: '国家税务总局北京市税务局',
    work_location: '北京市',
    total_score: 95,
    hard_score: 100,
    soft_score: 90,
    match_details: [
      { name: '学历', is_match: true, user_value: '本科', position_value: '本科及以上' },
      { name: '专业', is_match: true, user_value: '计算机科学与技术', position_value: '计算机类' },
      { name: '政治面貌', is_match: true, user_value: '中共党员', position_value: '中共党员' },
    ]
  },
  {
    id: 2,
    position_name: '信息技术岗',
    department_name: '海关总署广州海关',
    work_location: '广州市',
    total_score: 88,
    hard_score: 100,
    soft_score: 76,
    match_details: [
      { name: '学历', is_match: true, user_value: '本科', position_value: '本科及以上' },
      { name: '专业', is_match: true, user_value: '计算机科学与技术', position_value: '计算机类' },
      { name: '工作经验', is_match: false, user_value: '应届', position_value: '2年以上' },
    ]
  },
  {
    id: 3,
    position_name: '财务管理岗',
    department_name: '财政部驻北京专员办',
    work_location: '北京市',
    total_score: 72,
    hard_score: 80,
    soft_score: 64,
    match_details: [
      { name: '学历', is_match: true, user_value: '本科', position_value: '本科及以上' },
      { name: '专业', is_match: false, user_value: '计算机科学与技术', position_value: '财务会计类' },
      { name: '政治面貌', is_match: true, user_value: '中共党员', position_value: '不限' },
    ]
  },
]

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600 bg-green-100'
  if (score >= 70) return 'text-blue-600 bg-blue-100'
  if (score >= 50) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

function getScoreLabel(score: number) {
  if (score >= 90) return '完美匹配'
  if (score >= 70) return '高度匹配'
  if (score >= 50) return '部分匹配'
  return '匹配度低'
}

export default function MatchPage() {
  const [results] = useState<MatchResult[]>(mockResults)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selectedResult = results.find(r => r.id === selectedId)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">智能匹配</h1>
          <p className="text-gray-500 mt-1">根据您的条件智能匹配最适合的职位</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>筛选</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <RefreshCw className="w-4 h-4" />
            <span>重新匹配</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">匹配职位</p>
              <p className="text-xl font-bold text-gray-800">{results.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">高匹配度</p>
              <p className="text-xl font-bold text-gray-800">{results.filter(r => r.total_score >= 80).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">部分匹配</p>
              <p className="text-xl font-bold text-gray-800">{results.filter(r => r.total_score >= 50 && r.total_score < 80).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均匹配度</p>
              <p className="text-xl font-bold text-gray-800">
                {Math.round(results.reduce((acc, r) => acc + r.total_score, 0) / results.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => setSelectedId(result.id)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                selectedId === result.id ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-800">{result.position_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(result.total_score)}`}>
                      {getScoreLabel(result.total_score)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{result.department_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{result.work_location}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{result.total_score}%</div>
                  <p className="text-xs text-gray-500">匹配度</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex space-x-4 text-sm">
                  <span className="text-gray-500">硬性条件: <span className="font-medium text-gray-700">{result.hard_score}%</span></span>
                  <span className="text-gray-500">软性条件: <span className="font-medium text-gray-700">{result.soft_score}%</span></span>
                </div>
                <Link to={`/positions/${result.id}`} className="flex items-center text-primary text-sm hover:underline">
                  查看详情 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">匹配详情</h3>
            {selectedResult ? (
              <div className="space-y-4">
                <div className="text-center py-4 border-b">
                  <div className="text-4xl font-bold text-primary">{selectedResult.total_score}%</div>
                  <p className="text-gray-500 mt-1">{selectedResult.position_name}</p>
                </div>
                <div className="space-y-3">
                  {selectedResult.match_details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">{detail.name}</p>
                        <p className="text-xs text-gray-500">要求: {detail.position_value}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          detail.is_match ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {detail.is_match ? '符合' : '不符合'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">您: {detail.user_value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>点击左侧职位查看匹配详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
