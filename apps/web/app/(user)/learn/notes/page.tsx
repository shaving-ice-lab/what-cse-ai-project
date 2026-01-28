"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Loader2,
  Heart,
  Eye,
  Trash2,
  Edit3,
  ChevronRight,
  BookOpen,
  Globe,
  Lock,
  Filter,
  SortDesc,
  Calendar,
  Tag,
  Sparkles,
  Clock,
  User,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  StudyNote,
  UserNoteStats,
  NoteQueryParams,
  NoteType,
  getMyNotes,
  getPublicNotes,
  getMyNoteStats,
  createNote,
  updateNote,
  deleteNote,
  likeNote,
  unlikeNote,
  CreateNoteRequest,
  UpdateNoteRequest,
  NOTE_TYPE_OPTIONS,
} from "@/services/api/study-note";

// 笔记类型颜色映射
const noteTypeColors: Record<NoteType, { bg: string; text: string; icon: string }> = {
  course: { bg: "bg-blue-50", text: "text-blue-600", icon: "📚" },
  chapter: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "📖" },
  question: { bg: "bg-amber-50", text: "text-amber-600", icon: "❓" },
  knowledge: { bg: "bg-green-50", text: "text-green-600", icon: "💡" },
  free: { bg: "bg-purple-50", text: "text-purple-600", icon: "📝" },
  video: { bg: "bg-red-50", text: "text-red-600", icon: "🎬" },
};

// 统计卡片
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-stone-800">{value}</div>
          <div className="text-xs text-stone-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

// 笔记卡片
function NoteCard({
  note,
  onEdit,
  onDelete,
  onLike,
  onUnlike,
}: {
  note: StudyNote;
  onEdit: (note: StudyNote) => void;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
}) {
  const typeConfig = noteTypeColors[note.note_type] || noteTypeColors.free;
  const typeName = NOTE_TYPE_OPTIONS.find((t) => t.value === note.note_type)?.label || "笔记";

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
              {typeConfig.icon} {typeName}
            </span>
            {note.is_public ? (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> 公开
              </span>
            ) : (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> 私密
              </span>
            )}
          </div>
          {note.video_time !== undefined && note.video_time !== null && (
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatVideoTime(note.video_time)}
            </span>
          )}
        </div>

        <Link
          href={`/learn/notes/${note.id}`}
          className="text-lg font-semibold text-stone-800 hover:text-amber-600 transition-colors line-clamp-1"
        >
          {note.title}
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        {note.summary && (
          <p className="text-sm text-stone-600 line-clamp-3 mb-4">{note.summary}</p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 5 && (
              <span className="text-xs text-stone-400">+{note.tags.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-stone-400">
          {note.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {note.author.nickname}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(note.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {note.view_count}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => (note.is_liked ? onUnlike(note.id) : onLike(note.id))}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              note.is_liked
                ? "text-red-500 bg-red-50"
                : "text-stone-500 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${note.is_liked ? "fill-current" : ""}`} />
            {note.like_count}
          </button>

          {note.is_owner && (
            <>
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 笔记编辑器 Modal
function NoteEditorModal({
  note,
  onClose,
  onSave,
}: {
  note: StudyNote | null;
  onClose: () => void;
  onSave: (data: CreateNoteRequest | UpdateNoteRequest, id?: number) => void;
}) {
  const [noteType, setNoteType] = useState<NoteType>(note?.note_type || "free");
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(note?.is_public || false);
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      if (note) {
        await onSave({ title, content, tags, is_public: isPublic }, note.id);
      } else {
        await onSave({ note_type: noteType, title, content, tags, is_public: isPublic });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">
            {note ? "编辑笔记" : "创建笔记"}
          </h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Note Type */}
          {!note && (
            <div>
              <label className="text-sm font-medium text-stone-600 block mb-2">
                笔记类型
              </label>
              <div className="flex flex-wrap gap-2">
                {NOTE_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setNoteType(type.value as NoteType)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      noteType === type.value
                        ? "bg-amber-50 border-amber-200 text-amber-600"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {noteTypeColors[type.value as NoteType]?.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-stone-600 block mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入笔记标题..."
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-stone-600 block mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入笔记内容..."
              rows={10}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-stone-600 block mb-2">标签</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="输入标签后按 Enter..."
                className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-amber-50 text-amber-600 text-sm rounded-lg flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Public */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
            <span className="text-sm text-stone-600">公开笔记（其他用户可见）</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 格式化视频时间
function formatVideoTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NotesPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserNoteStats | null>(null);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [total, setTotal] = useState(0);

  // Tab
  const [tab, setTab] = useState<"my" | "public">("my");

  // Filters
  const [params, setParams] = useState<NoteQueryParams>({
    page: 1,
    page_size: 12,
  });
  const [keyword, setKeyword] = useState("");

  // Editor
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!token && tab === "my") return;

    setLoading(true);
    try {
      if (tab === "my") {
        const [statsRes, notesRes] = await Promise.all([
          getMyNoteStats(),
          getMyNotes(params),
        ]);
        setStats(statsRes);
        setNotes(notesRes.items || []);
        setTotal(notesRes.total);
      } else {
        const notesRes = await getPublicNotes(params);
        setNotes(notesRes.items || []);
        setTotal(notesRes.total);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }, [token, tab, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearch = () => {
    setParams((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleSaveNote = async (
    data: CreateNoteRequest | UpdateNoteRequest,
    id?: number
  ) => {
    try {
      if (id) {
        await updateNote(id, data as UpdateNoteRequest);
      } else {
        await createNote(data as CreateNoteRequest);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm("确定要删除这篇笔记吗？")) return;
    try {
      await deleteNote(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await likeNote(id);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_liked: true, like_count: n.like_count + 1 } : n
        )
      );
    } catch (error) {
      console.error("Failed to like note:", error);
    }
  };

  const handleUnlike = async (id: number) => {
    try {
      await unlikeNote(id);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_liked: false, like_count: Math.max(0, n.like_count - 1) }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to unlike note:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
            <Link href="/learn" className="hover:text-amber-600">
              学习中心
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>学习笔记</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              学习笔记
            </h1>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setShowEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                写笔记
              </button>
            )}
          </div>
        </div>

        {/* Stats (My Notes tab only) */}
        {isAuthenticated && tab === "my" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={FileText}
              label="全部笔记"
              value={stats.total_notes}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={Globe}
              label="公开笔记"
              value={stats.public_notes}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={Heart}
              label="获得点赞"
              value={stats.total_likes}
              color="bg-red-100 text-red-600"
            />
            <StatCard
              icon={Eye}
              label="总浏览量"
              value={stats.total_views}
              color="bg-amber-100 text-amber-600"
            />
            <StatCard
              icon={BookOpen}
              label="课程笔记"
              value={stats.course_notes}
              color="bg-purple-100 text-purple-600"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          {isAuthenticated && (
            <button
              onClick={() => setTab("my")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === "my"
                  ? "bg-amber-500 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              我的笔记
            </button>
          )}
          <button
            onClick={() => setTab("public")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === "public"
                ? "bg-amber-500 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            公开广场
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索笔记..."
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={params.note_type || ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  note_type: e.target.value as NoteType | "",
                  page: 1,
                }))
              }
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">全部类型</option>
              {NOTE_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${params.sort_by || "created_at"}-${params.sort_order || "desc"}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setParams((prev) => ({
                  ...prev,
                  sort_by: sortBy as any,
                  sort_order: sortOrder as any,
                  page: 1,
                }));
              }}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="created_at-desc">最新创建</option>
              <option value="updated_at-desc">最近更新</option>
              <option value="like_count-desc">最多点赞</option>
              <option value="view_count-desc">最多浏览</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : notes.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setShowEditor(true);
                  }}
                  onDelete={handleDeleteNote}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > params.page_size! && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                  disabled={params.page === 1}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-stone-500">
                  {params.page} / {Math.ceil(total / params.page_size!)}
                </span>
                <button
                  onClick={() =>
                    setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                  disabled={params.page! >= Math.ceil(total / params.page_size!)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <h3 className="text-lg font-medium text-stone-600 mb-2">
              {tab === "my" ? "还没有笔记" : "暂无公开笔记"}
            </h3>
            <p className="text-stone-400 mb-6">
              {tab === "my"
                ? "开始记录你的学习心得吧"
                : "成为第一个分享笔记的人"}
            </p>
            {isAuthenticated && tab === "my" && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setShowEditor(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                写第一篇笔记
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <NoteEditorModal
          note={editingNote}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}
