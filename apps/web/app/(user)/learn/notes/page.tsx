"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  HelpCircle,
  Lightbulb,
  PenLine,
  Video,
  LucideIcon,
  TrendingUp,
  Award,
  MessageSquare,
  Star,
  Bookmark,
  Share2,
  MoreHorizontal,
  Flame,
  Zap,
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
const noteTypeColors: Record<NoteType, { bg: string; text: string; border: string; icon: LucideIcon; gradient: string }> = {
  course: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
  chapter: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", icon: FileText, gradient: "from-indigo-500 to-purple-500" },
  question: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: HelpCircle, gradient: "from-amber-500 to-orange-500" },
  knowledge: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: Lightbulb, gradient: "from-emerald-500 to-teal-500" },
  free: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: PenLine, gradient: "from-purple-500 to-pink-500" },
  video: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: Video, gradient: "from-rose-500 to-red-500" },
};

// 热门标签
const POPULAR_TAGS = ["行测技巧", "申论范文", "面试模板", "时政热点", "法律常识", "数量关系"];

// 骨架屏加载组件
function NoteSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden animate-pulse">
      <div className="p-3 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-16 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-10 bg-stone-200 rounded"></div>
        </div>
        <div className="h-5 w-3/4 bg-stone-200 rounded"></div>
      </div>
      <div className="p-3">
        <div className="space-y-1.5 mb-3">
          <div className="h-3.5 bg-stone-200 rounded w-full"></div>
          <div className="h-3.5 bg-stone-200 rounded w-4/5"></div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-4 w-14 bg-stone-200 rounded"></div>
          <div className="h-4 w-10 bg-stone-200 rounded"></div>
        </div>
      </div>
      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex justify-between">
        <div className="flex gap-3">
          <div className="h-3.5 w-14 bg-stone-200 rounded"></div>
          <div className="h-3.5 w-10 bg-stone-200 rounded"></div>
        </div>
        <div className="h-5 w-14 bg-stone-200 rounded"></div>
      </div>
    </div>
  );
}

// 统计卡片
function StatCard({ icon: Icon, label, value, color, gradient, delay = 0 }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  gradient?: string;
  delay?: number;
}) {
  return (
    <div 
      className="group relative bg-white rounded-xl border border-stone-200/50 p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 背景装饰 */}
      <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br ${gradient || "from-amber-400/10 to-orange-400/10"} blur-xl group-hover:scale-125 transition-transform duration-500`}></div>
      
      <div className="relative flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xl font-bold text-stone-800 font-display tracking-tight leading-none">{value.toLocaleString()}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">{label}</div>
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
  index = 0,
}: {
  note: StudyNote;
  onEdit: (note: StudyNote) => void;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  index?: number;
}) {
  const typeConfig = noteTypeColors[note.note_type] || noteTypeColors.free;
  const typeName = NOTE_TYPE_OPTIONS.find((t) => t.value === note.note_type)?.label || "笔记";
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-xl border border-stone-200/50 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 顶部彩条 */}
      <div className={`h-0.5 bg-gradient-to-r ${typeConfig.gradient}`}></div>
      
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${typeConfig.bg} ${typeConfig.text} flex items-center gap-1`}>
              <typeConfig.icon className="w-3 h-3" /> {typeName}
            </span>
            {note.is_public ? (
              <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Globe className="w-2.5 h-2.5" /> 公开
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded">
                <Lock className="w-2.5 h-2.5" /> 私密
              </span>
            )}
          </div>
          {note.video_time !== undefined && note.video_time !== null && (
            <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatVideoTime(note.video_time)}
            </span>
          )}
        </div>

        <Link
          href={`/learn/notes/${note.id}`}
          className="block text-[15px] font-semibold text-stone-800 hover:text-amber-600 transition-colors line-clamp-2 leading-snug group-hover:text-amber-600"
        >
          {note.title}
        </Link>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {(note.summary || note.content) && (
          <p className="text-[13px] text-stone-500 line-clamp-2 mb-2 leading-relaxed">
            {note.summary || note.content?.slice(0, 80)}...
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-stone-50 text-stone-500 text-[11px] rounded border border-stone-100 hover:border-amber-300 hover:text-amber-600 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[11px] text-stone-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[11px] text-stone-400">
          {note.author && (
            <span className="flex items-center gap-1 font-medium text-stone-500">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[8px] font-bold">
                {note.author.nickname?.[0] || "U"}
              </div>
              {note.author.nickname}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" />
            {new Date(note.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-2.5 h-2.5" />
            {note.view_count}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => (note.is_liked ? onUnlike(note.id) : onLike(note.id))}
            className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[12px] font-medium transition-all ${
              note.is_liked
                ? "text-rose-500 bg-rose-50"
                : "text-stone-400 hover:text-rose-500 hover:bg-rose-50"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${note.is_liked ? "fill-current" : ""}`} />
            {note.like_count}
          </button>

          {note.is_owner && showActions && (
            <div className="flex items-center gap-0.5 animate-fade-in">
              <button
                onClick={() => onEdit(note)}
                className="p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="编辑"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
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

  const selectedTypeConfig = noteTypeColors[noteType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
        {/* 顶部彩条 */}
        <div className={`h-1 bg-gradient-to-r ${selectedTypeConfig?.gradient || "from-amber-400 to-orange-400"}`}></div>
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedTypeConfig?.gradient || "from-amber-400 to-orange-400"} flex items-center justify-center shadow-sm`}>
              {note ? <Edit3 className="w-4 h-4 text-white" /> : <PenLine className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-800">
                {note ? "编辑笔记" : "创建新笔记"}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Note Type */}
          {!note && (
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-2">
                笔记类型
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {NOTE_TYPE_OPTIONS.map((type) => {
                  const typeConfig = noteTypeColors[type.value as NoteType];
                  const TypeIcon = typeConfig?.icon;
                  const isSelected = noteType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setNoteType(type.value as NoteType)}
                      className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? `${typeConfig?.bg} ${typeConfig?.border} ${typeConfig?.text}`
                          : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {TypeIcon && <TypeIcon className={`w-4 h-4 ${isSelected ? "" : "text-stone-400"}`} />}
                      <span className="text-[11px] font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的笔记起个标题..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              内容
              <span className="text-stone-400 font-normal ml-1.5">支持 Markdown</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始记录你的学习心得..."
              rows={8}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none text-stone-700 placeholder:text-stone-400 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              标签
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 relative">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="输入标签按 Enter..."
                  className="w-full pl-8 pr-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                />
              </div>
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 bg-stone-100 text-stone-600 text-sm rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded flex items-center gap-1 border border-amber-200/50"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-amber-200 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5 rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                <span>推荐：</span>
                {["学习总结", "重点难点", "易错题"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTags([...tags, tag])}
                    className="px-1.5 py-0.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-600 rounded transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200/50">
            <div className="flex items-center gap-2.5">
              {isPublic ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-stone-500" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-stone-700">
                  {isPublic ? "公开笔记" : "私密笔记"}
                </div>
                <div className="text-[11px] text-stone-400">
                  {isPublic ? "其他用户可见" : "仅自己可见"}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-200 peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="text-[11px] text-stone-400">
            {content.length > 0 && `${content.length} 字`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-medium shadow-sm"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/50">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br from-purple-200/15 to-pink-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-6xl relative">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
            <Link href="/learn" className="hover:text-amber-600 transition-colors">
              学习中心
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-700 font-medium">学习笔记</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">学习笔记</h1>
                <p className="text-xs text-stone-500">记录学习心得，沉淀知识精华</p>
              </div>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => {
                  setEditingNote(null);
                  setShowEditor(true);
                }}
                className="group flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/20 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">写笔记</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats (My Notes tab only) */}
        {isAuthenticated && tab === "my" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <StatCard
              icon={FileText}
              label="全部笔记"
              value={stats.total_notes}
              color="bg-blue-100 text-blue-600"
              gradient="from-blue-400/10 to-cyan-400/10"
              delay={0}
            />
            <StatCard
              icon={Globe}
              label="公开笔记"
              value={stats.public_notes}
              color="bg-emerald-100 text-emerald-600"
              gradient="from-emerald-400/10 to-teal-400/10"
              delay={50}
            />
            <StatCard
              icon={Heart}
              label="获得点赞"
              value={stats.total_likes}
              color="bg-rose-100 text-rose-600"
              gradient="from-rose-400/10 to-pink-400/10"
              delay={100}
            />
            <StatCard
              icon={Eye}
              label="总浏览量"
              value={stats.total_views}
              color="bg-amber-100 text-amber-600"
              gradient="from-amber-400/10 to-orange-400/10"
              delay={150}
            />
            <StatCard
              icon={BookOpen}
              label="课程笔记"
              value={stats.course_notes}
              color="bg-purple-100 text-purple-600"
              gradient="from-purple-400/10 to-indigo-400/10"
              delay={200}
            />
          </div>
        )}

        {/* Tabs with sliding indicator */}
        <div className="flex items-center gap-1 mb-4 p-0.5 bg-stone-100/80 rounded-lg w-fit backdrop-blur-sm">
          {isAuthenticated && (
            <button
              onClick={() => setTab("my")}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                tab === "my"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                我的笔记
              </span>
            </button>
          )}
          <button
            onClick={() => setTab("public")}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              tab === "public"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              公开广场
              {tab === "public" && <Flame className="w-3 h-3 text-orange-500" />}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-sm p-3.5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索笔记..."
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all bg-white"
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
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-white cursor-pointer"
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
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-white cursor-pointer"
            >
              <option value="created_at-desc">最新创建</option>
              <option value="updated_at-desc">最近更新</option>
              <option value="like_count-desc">最多点赞</option>
              <option value="view_count-desc">最多浏览</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-sm"
            >
              搜索
            </button>
          </div>

          {/* Popular Tags */}
          {tab === "public" && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> 热门:
                </span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setKeyword(tag);
                      handleSearch();
                    }}
                    className="px-2 py-0.5 text-[11px] font-medium text-stone-500 bg-stone-100 hover:bg-amber-100 hover:text-amber-600 rounded transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <NoteSkeleton key={i} />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
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
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() =>
                    setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                  disabled={params.page === 1}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-all"
                >
                  上一页
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(total / params.page_size!)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setParams((prev) => ({ ...prev, page: pageNum }))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          params.page === pageNum
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-stone-500 hover:bg-stone-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {Math.ceil(total / params.page_size!) > 5 && (
                    <span className="text-stone-400 text-sm">...</span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                  disabled={params.page! >= Math.ceil(total / params.page_size!)}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-all"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="relative py-12">
            {/* 装饰背景 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-64 h-64 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative text-center">
              {/* 插画式图标 */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl rotate-6"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl -rotate-3"></div>
                <div className="relative w-full h-full bg-white rounded-2xl shadow-md flex items-center justify-center">
                  <FileText className="w-10 h-10 text-stone-300" />
                </div>
                {/* 装饰元素 */}
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center shadow-md animate-bounce">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-1 -left-1.5 w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-stone-700 mb-1.5">
                {tab === "my" ? "还没有笔记呢" : "暂无公开笔记"}
              </h3>
              <p className="text-sm text-stone-400 mb-5 max-w-xs mx-auto">
                {tab === "my"
                  ? "好记性不如烂笔头，开始记录你的学习心得吧"
                  : "快来成为第一个分享学习笔记的人"}
              </p>
              
              {isAuthenticated && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setShowEditor(true);
                    }}
                    className="group inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/20 hover:-translate-y-0.5 font-medium"
                  >
                    <PenLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    写第一篇笔记
                  </button>
                  {tab === "my" && (
                    <button
                      onClick={() => setTab("public")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-all font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      看看别人的
                    </button>
                  )}
                </div>
              )}
              
              {/* 引导提示 */}
              <div className="mt-8 flex items-center justify-center gap-5 text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                  </div>
                  <span>课程心得</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                  </div>
                  <span>知识要点</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                    <Share2 className="w-3 h-3 text-purple-500" />
                  </div>
                  <span>分享考友</span>
                </div>
              </div>
            </div>
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
