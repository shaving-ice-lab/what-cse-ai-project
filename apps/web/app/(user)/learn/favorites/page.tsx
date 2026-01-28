"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  BookOpen,
  FileQuestion,
  Brain,
  FolderPlus,
  Folder,
  Trash2,
  Search,
  Loader2,
  ArrowLeft,
  MoreVertical,
  Edit2,
  MoveRight,
  Star,
  ChevronRight,
  AlertCircle,
  Plus,
  BookMarked,
} from "lucide-react";
import { useLearningFavorites } from "@/hooks/useStudyTools";
import { useAuthStore } from "@/stores/authStore";
import { LearningFavorite, LearningFavoriteFolder, LearningContentType } from "@/services/api/study-tools";

// 内容类型配置
const contentTypes = [
  { key: "all", label: "全部", icon: Star },
  { key: "course", label: "课程", icon: BookOpen },
  { key: "question", label: "题目", icon: FileQuestion },
  { key: "knowledge", label: "知识点", icon: Brain },
  { key: "article", label: "文章", icon: BookMarked },
] as const;

// 获取内容类型图标
function getContentTypeIcon(type: LearningContentType) {
  switch (type) {
    case "course":
      return BookOpen;
    case "question":
      return FileQuestion;
    case "knowledge":
      return Brain;
    case "article":
      return BookMarked;
    default:
      return Star;
  }
}

// 获取内容类型颜色
function getContentTypeColor(type: LearningContentType) {
  switch (type) {
    case "course":
      return "bg-blue-100 text-blue-600";
    case "question":
      return "bg-green-100 text-green-600";
    case "knowledge":
      return "bg-purple-100 text-purple-600";
    case "article":
      return "bg-amber-100 text-amber-600";
    default:
      return "bg-stone-100 text-stone-600";
  }
}

// 获取内容类型名称
function getContentTypeName(type: LearningContentType) {
  switch (type) {
    case "course":
      return "课程";
    case "question":
      return "题目";
    case "knowledge":
      return "知识点";
    case "article":
      return "文章";
    default:
      return type;
  }
}

// 收藏夹卡片
function FolderCard({ 
  folder, 
  isSelected, 
  onSelect,
  onEdit,
  onDelete,
}: { 
  folder: LearningFavoriteFolder; 
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? "border-amber-400 bg-amber-50"
          : "border-stone-200 bg-white hover:border-amber-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: folder.color + "20", color: folder.color }}
        >
          <Folder className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-stone-800 truncate">{folder.name}</h4>
          <p className="text-sm text-stone-500">{folder.item_count} 个收藏</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 hover:bg-stone-100 rounded"
        >
          <MoreVertical className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-2 top-12 z-20 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-32">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDelete();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 收藏项卡片
function FavoriteCard({ 
  favorite, 
  onRemove,
  onMove,
}: { 
  favorite: LearningFavorite;
  onRemove: () => void;
  onMove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = getContentTypeIcon(favorite.content_type);

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getContentTypeColor(favorite.content_type)}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-stone-800 line-clamp-1">
                {favorite.content?.title || `${getContentTypeName(favorite.content_type)} #${favorite.content_id}`}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded ${getContentTypeColor(favorite.content_type)}`}>
                  {getContentTypeName(favorite.content_type)}
                </span>
                {favorite.folder_name && (
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    {favorite.folder_name}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-stone-100 rounded"
              >
                <MoreVertical className="w-4 h-4 text-stone-400" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-32">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onMove();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <MoveRight className="w-4 h-4" />
                      移动到
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRemove();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      取消收藏
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {favorite.note && (
            <p className="text-sm text-stone-500 mt-2 line-clamp-2">{favorite.note}</p>
          )}

          {favorite.tags && favorite.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {favorite.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 创建收藏夹对话框
function CreateFolderModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#64748b"];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), color);
      setName("");
      setColor("#6366f1");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">创建收藏夹</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入收藏夹名称"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">颜色</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${color === c ? "ring-2 ring-offset-2 ring-stone-400 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}

// 移动到收藏夹对话框
function MoveFolderModal({ 
  isOpen, 
  onClose, 
  folders,
  onMove 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  folders: LearningFavoriteFolder[];
  onMove: (folderId: number | null) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">移动到收藏夹</h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <button
            onClick={() => onMove(null)}
            className="w-full p-3 text-left rounded-lg hover:bg-stone-50 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-stone-500" />
            </div>
            <span className="text-stone-700">未分类</span>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onMove(folder.id)}
              className="w-full p-3 text-left rounded-lg hover:bg-stone-50 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: folder.color + "20", color: folder.color }}
              >
                <Folder className="w-4 h-4" />
              </div>
              <span className="text-stone-700">{folder.name}</span>
              <span className="text-sm text-stone-400 ml-auto">{folder.item_count}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 mt-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function LearningFavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    loading,
    favorites,
    folders,
    stats,
    total,
    fetchFavorites,
    fetchFolders,
    fetchStats,
    removeFavorite,
    createFolder,
    deleteFolder,
    moveToFolder,
  } = useLearningFavorites();

  const [activeType, setActiveType] = useState<LearningContentType | "all">("all");
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [movingFavorite, setMovingFavorite] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolders();
      fetchStats();
    }
  }, [isAuthenticated, fetchFolders, fetchStats]);

  // 加载收藏列表
  useEffect(() => {
    if (isAuthenticated) {
      const params: any = { page, page_size: pageSize };
      if (activeType !== "all") {
        params.content_type = activeType;
      }
      if (activeFolder !== null) {
        params.folder_id = activeFolder;
      }
      fetchFavorites(params);
    }
  }, [isAuthenticated, activeType, activeFolder, page, fetchFavorites]);

  // 处理创建收藏夹
  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder({ name, color });
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  // 处理删除收藏夹
  const handleDeleteFolder = async (folderId: number) => {
    if (confirm("删除收藏夹后，其中的收藏将移动到"未分类"，确定删除吗？")) {
      try {
        await deleteFolder(folderId);
        if (activeFolder === folderId) {
          setActiveFolder(null);
        }
      } catch (err) {
        console.error("Failed to delete folder:", err);
      }
    }
  };

  // 处理取消收藏
  const handleRemoveFavorite = async (favoriteId: number) => {
    if (confirm("确定要取消收藏吗？")) {
      try {
        await removeFavorite(favoriteId);
      } catch (err) {
        console.error("Failed to remove favorite:", err);
      }
    }
  };

  // 处理移动收藏
  const handleMoveFavorite = async (folderId: number | null) => {
    if (movingFavorite === null) return;
    try {
      await moveToFolder(movingFavorite, folderId);
      setMovingFavorite(null);
    } catch (err) {
      console.error("Failed to move favorite:", err);
    }
  };

  // 未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">请先登录</h2>
            <p className="text-stone-500 mb-6">登录后即可查看学习收藏</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <div className="mb-8">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回学习中心
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                <Heart className="w-6 h-6 text-amber-500" />
                学习收藏
              </h1>
              <p className="text-stone-500 mt-1">管理你收藏的学习内容</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 左侧边栏 - 收藏夹 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">收藏夹</h3>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg"
                  title="创建收藏夹"
                >
                  <FolderPlus className="w-5 h-5 text-amber-500" />
                </button>
              </div>

              <div className="space-y-2">
                {/* 全部收藏 */}
                <button
                  onClick={() => setActiveFolder(null)}
                  className={`w-full p-3 text-left rounded-lg transition-colors flex items-center gap-3 ${
                    activeFolder === null
                      ? "bg-amber-50 text-amber-700"
                      : "hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="flex-1">全部收藏</span>
                  <span className="text-sm text-stone-400">{stats?.total || 0}</span>
                </button>

                {/* 收藏夹列表 */}
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={activeFolder === folder.id}
                    onSelect={() => setActiveFolder(folder.id)}
                    onEdit={() => {}}
                    onDelete={() => handleDeleteFolder(folder.id)}
                  />
                ))}
              </div>
            </div>

            {/* 统计信息 */}
            {stats && (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-4 mt-4">
                <h3 className="font-semibold text-stone-800 mb-3">收藏统计</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(stats)
                    .filter(([key]) => key !== "total")
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-stone-500">{getContentTypeName(key as LearningContentType)}</span>
                        <span className="text-stone-800 font-medium">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧 - 收藏列表 */}
          <div className="lg:col-span-3">
            {/* 类型筛选 */}
            <div className="bg-white rounded-2xl border border-stone-200/50 p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setActiveType(type.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeType === type.key
                        ? "bg-amber-500 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 收藏列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200/50 p-8 text-center">
                <Heart className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">暂无收藏</h3>
                <p className="text-stone-500 mb-6">在学习过程中，收藏喜欢的内容吧</p>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  去学习
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <FavoriteCard
                    key={favorite.id}
                    favorite={favorite}
                    onRemove={() => handleRemoveFavorite(favorite.id)}
                    onMove={() => setMovingFavorite(favorite.id)}
                  />
                ))}
              </div>
            )}

            {/* 分页 */}
            {total > pageSize && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-stone-600">
                  {page} / {Math.ceil(total / pageSize)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 创建收藏夹对话框 */}
        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onSubmit={handleCreateFolder}
        />

        {/* 移动收藏夹对话框 */}
        <MoveFolderModal
          isOpen={movingFavorite !== null}
          onClose={() => setMovingFavorite(null)}
          folders={folders}
          onMove={handleMoveFavorite}
        />
      </div>
    </div>
  );
}
