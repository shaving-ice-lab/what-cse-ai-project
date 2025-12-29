import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Users, Trash2, ExternalLink } from 'lucide-react'

interface FavoritePosition {
  id: number
  position_name: string
  department_name: string
  work_location: string
  recruit_count: number
  education_requirement: string
  created_at: string
}

const mockFavorites: FavoritePosition[] = [
  {
    id: 1,
    position_name: '综合管理岗',
    department_name: '国家税务总局北京市税务局',
    work_location: '北京市',
    recruit_count: 3,
    education_requirement: '本科及以上',
    created_at: '2024-11-01',
  },
  {
    id: 2,
    position_name: '信息技术岗',
    department_name: '海关总署广州海关',
    work_location: '广州市',
    recruit_count: 2,
    education_requirement: '本科及以上',
    created_at: '2024-10-28',
  },
  {
    id: 3,
    position_name: '法律事务岗',
    department_name: '最高人民法院',
    work_location: '北京市',
    recruit_count: 1,
    education_requirement: '硕士研究生及以上',
    created_at: '2024-10-25',
  },
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePosition[]>(mockFavorites)

  const handleRemove = (id: number) => {
    setFavorites(favorites.filter(f => f.id !== id))
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的收藏</h1>
          <p className="text-gray-500 mt-1">已收藏 {favorites.length} 个职位</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((position) => (
            <div
              key={position.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/positions/${position.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors"
                  >
                    {position.position_name}
                  </Link>
                  <p className="text-gray-600 mt-1">{position.department_name}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{position.work_location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>招{position.recruit_count}人</span>
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {position.education_requirement}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/positions/${position.id}`}
                    className="flex items-center text-primary text-sm hover:underline"
                  >
                    查看详情
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                  <button
                    onClick={() => handleRemove(position.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="取消收藏"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                收藏于 {position.created_at}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Heart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">暂无收藏的职位</p>
          <Link
            to="/positions"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            去浏览职位
          </Link>
        </div>
      )}
    </div>
  )
}
