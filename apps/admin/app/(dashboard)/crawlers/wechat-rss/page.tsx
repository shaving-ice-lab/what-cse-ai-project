"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
  Rss,
  BookOpen,
  Star,
  StarOff,
  Check,
  CheckCheck,
  AlertCircle,
  Pause,
  Play,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Link2,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  LogOut,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@what-cse/ui";
import {
  wechatRssApi,
  wechatMpAuthApi,
  WechatRSSSource,
  WechatRSSArticle,
  WechatRSSStats,
  WechatRSSSourceStatus,
  WechatRSSReadStatus,
  WechatMPAuthResponse,
  WechatMPAccountInfo,
  WechatMPArticle,
} from "@/services/api";

// ============================================================
// 添加订阅对话框组件
// ============================================================
function AddSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"article" | "search">("article");
  const [articleUrl, setArticleUrl] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<WechatMPAccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 重置状态
  const resetState = useCallback(() => {
    setMode("article");
    setArticleUrl("");
    setSearchKeyword("");
    setSearchResults([]);
    setLoading(false);
    setSubscribingId(null);
    setError("");
  }, []);

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(resetState, 200);
      return () => clearTimeout(timer);
    }
  }, [open, resetState]);

  // 通过文章链接添加
  const handleAddViaArticle = async () => {
    if (!articleUrl.trim()) return;
    setLoading(true);
    setError("");
    try {
      await wechatMpAuthApi.createSourceViaAPI(articleUrl.trim());
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "添加失败，请检查链接是否正确");
    } finally {
      setLoading(false);
    }
  };

  // 搜索公众号
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const res = await wechatMpAuthApi.searchAccount(searchKeyword.trim());
      if (res?.accounts?.length) {
        setSearchResults(res.accounts);
      } else {
        setError("未找到相关公众号，请尝试其他关键词");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setLoading(false);
    }
  };

  // 订阅公众号
  const handleSubscribe = async (account: WechatMPAccountInfo) => {
    setSubscribingId(account.fake_id);
    setError("");
    try {
      await wechatMpAuthApi.createSourceViaAccount(account);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "订阅失败");
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <DialogTitle className="text-base">添加订阅</DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            通过文章链接或搜索公众号名称添加
          </DialogDescription>
        </div>

        {/* Mode Selector */}
        <div className="border-b px-6 py-3">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
            <button
              onClick={() => { setMode("article"); setError(""); }}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "article"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              文章链接
            </button>
            <button
              onClick={() => { setMode("search"); setError(""); }}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                mode === "search"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              搜索公众号
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {mode === "article" ? (
            /* 文章链接模式 */
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="粘贴微信公众号文章链接..."
                    value={articleUrl}
                    onChange={(e) => { setArticleUrl(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddViaArticle()}
                    className="h-10 pr-10 text-sm"
                  />
                  {articleUrl && (
                    <button
                      onClick={() => setArticleUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  支持 mp.weixin.qq.com 的文章链接，系统将自动识别公众号
                </p>
              </div>

              {/* 示例提示 */}
              <div className="rounded-lg border border-dashed bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">示例链接格式</p>
                <code className="mt-1 block truncate text-xs text-muted-foreground/80">
                  https://mp.weixin.qq.com/s/xxxxxxxx
                </code>
              </div>
            </div>
          ) : (
            /* 搜索模式 */
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入公众号名称搜索..."
                  value={searchKeyword}
                  onChange={(e) => { setSearchKeyword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-10 text-sm"
                />
                <Button
                  onClick={handleSearch}
                  disabled={!searchKeyword.trim() || loading}
                  className="h-10 px-4"
                >
                  {loading && !subscribingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    找到 {searchResults.length} 个公众号
                  </p>
                  <div className="max-h-[240px] space-y-1.5 overflow-y-auto">
                    {searchResults.map((account) => (
                      <div
                        key={account.fake_id}
                        className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        {account.round_head_img ? (
                          <img
                            src={account.round_head_img}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500">
                            <Rss className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{account.nickname}</p>
                          {account.alias && (
                            <p className="truncate text-xs text-muted-foreground">微信号: {account.alias}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSubscribe(account)}
                          disabled={subscribingId === account.fake_id}
                          className="h-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[disabled]:opacity-100"
                        >
                          {subscribingId === account.fake_id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          订阅
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !loading && !error && (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">输入公众号名称开始搜索</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">如：人民日报、腾讯科技</p>
                </div>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          {mode === "article" && (
            <Button
              size="sm"
              onClick={handleAddViaArticle}
              disabled={!articleUrl.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  添加中...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  添加订阅
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 订阅源详情面板（查看最近文章）
// ============================================================
function SourceDetailSheet({
  source,
  open,
  onOpenChange,
}: {
  source: WechatRSSSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [articles, setArticles] = useState<WechatMPArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  // 重置状态
  const resetState = useCallback(() => {
    setArticles([]);
    setTotalCount(0);
    setError("");
  }, []);

  // 初始加载文章
  const loadArticles = useCallback(async () => {
    if (!source?.fake_id) return;
    setLoading(true);
    setError("");
    try {
      const res = await wechatMpAuthApi.getArticles(source.fake_id, 0, PAGE_SIZE);
      if (res) {
        setArticles(res.articles || []);
        setTotalCount(res.app_msg_cnt || 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [source?.fake_id]);

  // 加载更多文章
  const loadMoreArticles = async () => {
    if (!source?.fake_id || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const res = await wechatMpAuthApi.getArticles(source.fake_id, articles.length, PAGE_SIZE);
      if (res?.articles?.length) {
        setArticles(prev => [...prev, ...res.articles]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoadingMore(false);
    }
  };

  // 打开时加载，关闭时重置
  useEffect(() => {
    if (open && source?.fake_id) {
      loadArticles();
    } else if (!open) {
      // 延迟重置，等动画结束
      const timer = setTimeout(resetState, 200);
      return () => clearTimeout(timer);
    }
  }, [open, source?.fake_id, loadArticles, resetState]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 是否还有更多
  const hasMore = articles.length < totalCount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-lg">
        {source && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3">
                {source.icon_url ? (
                  <img
                    src={source.icon_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <Rss className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-base">{source.name}</SheetTitle>
                  {source.wechat_id && (
                    <p className="text-xs text-muted-foreground">@{source.wechat_id}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      source.status === "active" ? "bg-emerald-500" : "bg-stone-400"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {source.status === "active" ? "运行中" : "已暂停"}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  已收录 {source.article_count} 篇
                </span>
                {totalCount > 0 && (
                  <span className="text-muted-foreground">
                    平台共 {totalCount} 篇
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error && articles.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive/50" />
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={loadArticles}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    重试
                  </Button>
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  {totalCount > 0 ? (
                    <>
                      <p className="mt-2 text-sm text-muted-foreground">平台共 {totalCount} 篇文章</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">点击下方按钮加载文章列表</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-muted-foreground">暂无文章</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">可能尚未获取到文章列表</p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={loadArticles}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        加载中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        {totalCount > 0 ? "加载文章" : "尝试加载"}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {articles.map((article, index) => (
                    <a
                      key={`${article.aid}-${index}`}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-4 transition-colors hover:bg-muted/50"
                    >
                      {article.cover && (
                        <img
                          src={article.cover}
                          alt=""
                          className="h-16 w-24 shrink-0 rounded-md object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        {article.digest && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {article.digest}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-muted-foreground/70">
                          {formatTime(article.create_time)}
                        </p>
                      </div>
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                    </a>
                  ))}

                  {/* 加载更多按钮 */}
                  {hasMore && (
                    <div className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={loadMoreArticles}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            加载中...
                          </>
                        ) : (
                          <>
                            <ChevronRight className="mr-1.5 h-3.5 w-3.5 rotate-90" />
                            加载更早的文章
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* 加载更多时的错误提示 */}
                  {error && articles.length > 0 && (
                    <div className="p-4">
                      <div className="flex items-center justify-center gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{error}</span>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={loadMoreArticles}>
                          重试
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {articles.length > 0 && !loading && (
              <div className="border-t bg-muted/30 px-6 py-3">
                <p className="text-center text-xs text-muted-foreground">
                  已加载 {articles.length} / {totalCount} 篇文章
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// 订阅源卡片组件
// ============================================================
function SourceCard({
  source,
  onCrawl,
  onToggleStatus,
  onEdit,
  onDelete,
  onClick,
  crawling,
}: {
  source: WechatRSSSource;
  onCrawl: () => void;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  crawling: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:border-stone-300 dark:hover:border-stone-600">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {source.icon_url ? (
            <img
              src={source.icon_url}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800">
              <Rss className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-medium truncate text-sm">{source.name}</h3>
            {source.wechat_id && (
              <p className="text-xs text-muted-foreground truncate">
                @{source.wechat_id}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              source.status === "active"
                ? "bg-emerald-500"
                : source.status === "error"
                ? "bg-red-500"
                : "bg-stone-400"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {source.status === "active"
              ? "运行中"
              : source.status === "error"
              ? "错误"
              : "已暂停"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">文章</span>
          <span className="ml-1 font-medium">{source.article_count}</span>
        </div>
        <div>
          <span className="text-muted-foreground">未读</span>
          <span
            className={`ml-1 font-medium ${
              source.unread_count > 0 ? "text-amber-600" : ""
            }`}
          >
            {source.unread_count}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">频率</span>
          <span className="ml-1 font-medium">{source.crawl_frequency}分钟</span>
        </div>
      </div>

      {/* Last crawl */}
      {source.last_crawl_at && (
        <p className="mt-2 text-xs text-muted-foreground">
          最后抓取:{" "}
          {new Date(source.last_crawl_at).toLocaleString("zh-CN", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1 border-t pt-3" onClick={(e) => e.stopPropagation()}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onCrawl}
                disabled={crawling}
              >
                {crawling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">立即抓取</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onToggleStatus}
              >
                {source.status === "active" ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {source.status === "active" ? "暂停" : "启用"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onEdit}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">编辑</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">删除</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// 文章列表项组件
function ArticleItem({
  article,
  onClick,
  onToggleStar,
  onOpenOriginal,
}: {
  article: WechatRSSArticle;
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
  onOpenOriginal: (e: React.MouseEvent) => void;
}) {
  const isUnread = article.read_status === "unread";
  const isStarred = article.read_status === "starred";

  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer gap-3 border-b py-3 transition-colors hover:bg-muted/50 ${
        isUnread ? "bg-amber-50/50 dark:bg-amber-950/10" : ""
      }`}
    >
      {/* Image */}
      {article.image_url && (
        <img
          src={article.image_url}
          alt=""
          className="h-14 w-20 flex-shrink-0 rounded object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h4
            className={`flex-1 text-sm leading-snug line-clamp-2 ${
              isUnread ? "font-medium" : "text-muted-foreground"
            }`}
          >
            {isUnread && (
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
            )}
            {article.title}
          </h4>
          {isStarred && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{article.source_name}</span>
          {article.pub_date && (
            <span>
              {new Date(article.pub_date).toLocaleDateString("zh-CN", {
                month: "numeric",
                day: "numeric",
              })}
            </span>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleStar}
            >
              {isStarred ? (
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              ) : (
                <StarOff className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onOpenOriginal}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WechatRSSPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<WechatRSSSource[]>([]);
  const [articles, setArticles] = useState<WechatRSSArticle[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesPage, setArticlesPage] = useState(1);
  const [stats, setStats] = useState<WechatRSSStats | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<WechatRSSSource | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    crawl_frequency: 60,
    description: "",
  });
  const [articleSheetOpen, setArticleSheetOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<WechatRSSArticle | null>(null);
  
  // Source detail sheet (查看公众号最近文章)
  const [sourceDetailOpen, setSourceDetailOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<WechatRSSSource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<WechatRSSSource | null>(null);

  // Add subscription dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // WeChat MP Auth states
  const [mpAuthStatus, setMpAuthStatus] = useState<WechatMPAuthResponse | null>(null);
  const [mpAuthLoading, setMpAuthLoading] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeUuid, setQrCodeUuid] = useState("");
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string>("waiting");
  const shouldPollRef = useRef(false);

  // Loading states
  const [saving, setSaving] = useState(false);
  const [crawling, setCrawling] = useState<number | null>(null);

  // Filter states
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterReadStatus, setFilterReadStatus] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState("sources");

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      const res = await wechatRssApi.getSources();
      if (res) {
        setSources(res.sources || []);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    }
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      const res = await wechatRssApi.getArticles({
        source_id: filterSource !== "all" ? parseInt(filterSource) : undefined,
        read_status: filterReadStatus !== "all" ? (filterReadStatus as WechatRSSReadStatus) : undefined,
        keyword: filterKeyword || undefined,
        page: articlesPage,
        page_size: 20,
      });
      if (res) {
        setArticles(res.articles || []);
        setArticlesTotal(res.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    }
  }, [filterSource, filterReadStatus, filterKeyword, articlesPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await wechatRssApi.getStats();
      if (res) {
        setStats(res);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Fetch WeChat MP auth status
  const fetchMpAuthStatus = useCallback(async () => {
    try {
      setMpAuthLoading(true);
      const res = await wechatMpAuthApi.getAuthStatus();
      if (res) {
        setMpAuthStatus(res);
      }
    } catch (error) {
      console.error("Failed to fetch MP auth status:", error);
    } finally {
      setMpAuthLoading(false);
    }
  }, []);

  // Get QR code for WeChat MP login
  const handleGetQRCode = async () => {
    try {
      setQrCodeLoading(true);
      setLoginStatus("waiting");
      const res = await wechatMpAuthApi.getQRCode();
      if (res) {
        setQrCodeUrl(res.qrcode_url);
        setQrCodeUuid(res.uuid);
        setQrCodeDialogOpen(true);
        shouldPollRef.current = true;
        pollLoginStatus(res.uuid);
      }
    } catch (error) {
      console.error("Failed to get QR code:", error);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleCloseQrCodeDialog = () => {
    shouldPollRef.current = false;
    setQrCodeDialogOpen(false);
  };

  const pollLoginStatus = async (uuid: string) => {
    let attempts = 0;
    const maxAttempts = 100;

    const poll = async () => {
      if (attempts >= maxAttempts || !shouldPollRef.current) {
        if (shouldPollRef.current) {
          setLoginStatus("expired");
        }
        return;
      }

      try {
        const res = await wechatMpAuthApi.checkLoginStatus(uuid);
        if (res) {
          setLoginStatus(res.status);

          if (res.status === "confirmed") {
            shouldPollRef.current = false;
            setQrCodeDialogOpen(false);
            fetchMpAuthStatus();
            return;
          } else if (res.status === "expired" || res.status === "cancelled") {
            shouldPollRef.current = false;
            return;
          }
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      }

      attempts++;
      setTimeout(poll, 3000);
    };

    poll();
  };

  const handleMpLogout = async () => {
    try {
      await wechatMpAuthApi.logout();
      setMpAuthStatus(null);
      fetchMpAuthStatus();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // 添加订阅成功回调
  const handleAddSubscriptionSuccess = useCallback(() => {
    fetchSources();
    fetchStats();
  }, [fetchSources, fetchStats]);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSources(), fetchStats(), fetchMpAuthStatus()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchSources, fetchStats, fetchMpAuthStatus]);

  // Fetch articles when tab changes or filters change
  useEffect(() => {
    if (activeTab === "articles") {
      fetchArticles();
    }
  }, [activeTab, fetchArticles]);

  // Update source
  const handleUpdateSource = async () => {
    if (!editingSource) return;

    setSaving(true);
    try {
      await wechatRssApi.updateSource(editingSource.id, {
        name: editForm.name,
        crawl_frequency: editForm.crawl_frequency,
        description: editForm.description || undefined,
      });
      setEditDialogOpen(false);
      setEditingSource(null);
      fetchSources();
    } catch (error) {
      console.error("Failed to update source:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete source
  const handleDeleteSource = async () => {
    if (!sourceToDelete) return;

    try {
      await wechatRssApi.deleteSource(sourceToDelete.id);
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
      fetchSources();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete source:", error);
    }
  };

  // Crawl source
  const handleCrawlSource = async (sourceId: number) => {
    setCrawling(sourceId);
    try {
      await wechatRssApi.crawlSource(sourceId);
      fetchSources();
      fetchStats();
      if (activeTab === "articles") {
        fetchArticles();
      }
    } catch (error) {
      console.error("Failed to crawl source:", error);
    } finally {
      setCrawling(null);
    }
  };

  // Toggle source status
  const handleToggleSourceStatus = async (source: WechatRSSSource) => {
    const newStatus: WechatRSSSourceStatus =
      source.status === "active" ? "paused" : "active";
    try {
      await wechatRssApi.updateSource(source.id, { status: newStatus });
      fetchSources();
    } catch (error) {
      console.error("Failed to toggle source status:", error);
    }
  };

  // Mark article as read
  const handleMarkRead = async (articleId: number) => {
    try {
      await wechatRssApi.markArticleRead(articleId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to mark article as read:", error);
    }
  };

  // Toggle article star
  const handleToggleStar = async (articleId: number) => {
    try {
      await wechatRssApi.toggleArticleStar(articleId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const sourceId = filterSource !== "all" ? parseInt(filterSource) : undefined;
      await wechatRssApi.markAllAsRead(sourceId);
      fetchArticles();
      fetchStats();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (source: WechatRSSSource) => {
    setEditingSource(source);
    setEditForm({
      name: source.name,
      crawl_frequency: source.crawl_frequency,
      description: source.description || "",
    });
    setEditDialogOpen(true);
  };

  // View article
  const handleViewArticle = async (article: WechatRSSArticle) => {
    setSelectedArticle(article);
    setArticleSheetOpen(true);
    if (article.read_status === "unread") {
      await handleMarkRead(article.id);
    }
  };

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  // Auth status icon
  const getAuthIcon = () => {
    if (!mpAuthStatus) return Shield;
    switch (mpAuthStatus.status) {
      case "active":
        return ShieldCheck;
      case "expiring":
        return ShieldAlert;
      default:
        return ShieldX;
    }
  };
  const AuthIcon = getAuthIcon();

  // Check if auth is valid
  const isAuthValid = mpAuthStatus?.status === "active" || mpAuthStatus?.status === "expiring";

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">公众号订阅</h1>
          <p className="text-sm text-muted-foreground">
            订阅微信公众号，自动同步最新文章
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            disabled={!isAuthValid}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            添加订阅
          </Button>
        </div>
      </div>

      {/* Stats + Auth Row */}
      <div className="grid gap-3 lg:grid-cols-[1fr,auto]">
        {/* Stats */}
        <div className="flex items-center gap-6 rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">订阅源</p>
              <p className="text-lg font-semibold leading-none">
                {stats?.total_sources || 0}
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">文章总数</p>
            <p className="text-lg font-semibold leading-none">
              {stats?.total_articles || 0}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">未读</p>
            <p className="text-lg font-semibold leading-none text-amber-600">
              {stats?.unread_articles || 0}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">收藏</p>
            <p className="text-lg font-semibold leading-none">
              {stats?.starred_articles || 0}
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">今日新增</p>
            <p className="text-lg font-semibold leading-none">
              {stats?.today_articles || 0}
            </p>
          </div>
        </div>

        {/* Auth Status */}
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <AuthIcon
              className={`h-4 w-4 ${
                mpAuthStatus?.status === "active"
                  ? "text-emerald-500"
                  : mpAuthStatus?.status === "expiring"
                  ? "text-amber-500"
                  : "text-muted-foreground"
              }`}
            />
            <div>
              <p className="text-xs text-muted-foreground">微信平台授权</p>
              <p className="text-sm font-medium">
                {mpAuthStatus?.status === "active"
                  ? "已授权"
                  : mpAuthStatus?.status === "expiring"
                  ? "即将过期"
                  : "未授权"}
              </p>
            </div>
          </div>
          {/* 显示登录的公众号信息 */}
          {isAuthValid && mpAuthStatus?.account_name && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">公众号</p>
                <p className="text-sm font-medium">{mpAuthStatus.account_name}</p>
              </div>
              {mpAuthStatus.account_id && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">账号ID</p>
                    <p className="text-sm font-mono text-muted-foreground">{mpAuthStatus.account_id}</p>
                  </div>
                </>
              )}
              {mpAuthStatus.expires_at && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">过期时间</p>
                    <p className={`text-sm ${mpAuthStatus.status === "expiring" ? "text-amber-600" : "text-muted-foreground"}`}>
                      {new Date(mpAuthStatus.expires_at).toLocaleString("zh-CN", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          {mpAuthStatus?.status === "active" ||
          mpAuthStatus?.status === "expiring" ? (
            <div className="flex items-center gap-1 ml-auto">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleMpLogout}>
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">退出登录</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleGetQRCode}
                      disabled={qrCodeLoading}
                    >
                      {qrCodeLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <QrCode className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">重新授权</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={handleGetQRCode}
              disabled={qrCodeLoading}
            >
              {qrCodeLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <QrCode className="mr-1.5 h-3.5 w-3.5" />
              )}
              扫码授权
            </Button>
          )}
        </div>
      </div>

      {/* Auth Required Notice */}
      {!isAuthValid && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              需要微信公众平台授权
            </p>
          </div>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            请先使用微信扫码登录公众平台，授权后即可添加和同步公众号文章。
            您需要拥有一个微信公众号（个人订阅号即可）。
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="h-9">
            <TabsTrigger value="sources" className="text-sm">
              订阅源
            </TabsTrigger>
            <TabsTrigger value="articles" className="text-sm">
              文章
              {stats?.unread_articles ? (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                  {stats.unread_articles}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {activeTab === "sources" && sources.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-3">
          {sources.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10">
                <Rss className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">暂无订阅源</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isAuthValid
                    ? "粘贴微信公众号文章链接添加订阅"
                    : "请先扫码授权后添加订阅"}
                </p>
                {isAuthValid && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    添加订阅
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onCrawl={() => handleCrawlSource(source.id)}
                  onToggleStatus={() => handleToggleSourceStatus(source)}
                  onEdit={() => openEditDialog(source)}
                  onDelete={() => {
                    setSourceToDelete(source);
                    setDeleteDialogOpen(true);
                  }}
                  onClick={() => {
                    setSelectedSource(source);
                    setSourceDetailOpen(true);
                  }}
                  crawling={crawling === source.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">文章</TableHead>
                    <TableHead className="text-right">未读</TableHead>
                    <TableHead>频率</TableHead>
                    <TableHead>最后抓取</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {source.icon_url ? (
                            <img
                              src={source.icon_url}
                              alt=""
                              className="h-7 w-7 rounded object-cover"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded bg-muted flex items-center justify-center">
                              <Rss className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{source.name}</p>
                            {source.wechat_id && (
                              <p className="text-xs text-muted-foreground">
                                @{source.wechat_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              source.status === "active"
                                ? "bg-emerald-500"
                                : source.status === "error"
                                ? "bg-red-500"
                                : "bg-stone-400"
                            }`}
                          />
                          <span className="text-xs">
                            {source.status === "active"
                              ? "运行"
                              : source.status === "error"
                              ? "错误"
                              : "暂停"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {source.article_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {source.unread_count > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {source.unread_count}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {source.crawl_frequency}分钟
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {source.last_crawl_at
                          ? new Date(source.last_crawl_at).toLocaleString(
                              "zh-CN",
                              {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleCrawlSource(source.id)}
                            disabled={crawling === source.id}
                          >
                            {crawling === source.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleToggleSourceStatus(source)}
                          >
                            {source.status === "active" ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditDialog(source)}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setSourceToDelete(source);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="mt-3 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="全部订阅源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部订阅源</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id.toString()}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterReadStatus} onValueChange={setFilterReadStatus}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="unread">未读</SelectItem>
                <SelectItem value="read">已读</SelectItem>
                <SelectItem value="starred">收藏</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="h-8 w-[180px] pl-7 text-xs"
              />
            </div>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={!stats?.unread_articles}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              全部已读
            </Button>
          </div>

          {/* Articles List */}
          <Card>
            <CardContent className="p-0">
              {articles.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium">暂无文章</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    添加订阅后，文章将自动出现在这里
                  </p>
                </div>
              ) : (
                <div className="divide-y px-4">
                  {articles.map((article) => (
                    <ArticleItem
                      key={article.id}
                      article={article}
                      onClick={() => handleViewArticle(article)}
                      onToggleStar={(e) => {
                        e.stopPropagation();
                        handleToggleStar(article.id);
                      }}
                      onOpenOriginal={(e) => {
                        e.stopPropagation();
                        window.open(article.link, "_blank");
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {articlesTotal > 20 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                共 {articlesTotal} 篇文章
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setArticlesPage((p) => Math.max(1, p - 1))}
                  disabled={articlesPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 text-xs">
                  {articlesPage} / {Math.ceil(articlesTotal / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setArticlesPage((p) => p + 1)}
                  disabled={articlesPage >= Math.ceil(articlesTotal / 20)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Subscription Dialog */}
      <AddSubscriptionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSubscriptionSuccess}
      />

      {/* Edit Source Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingSource(null);
          setEditDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑订阅源</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">
                名称
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="crawl_frequency" className="text-xs">
                抓取频率（分钟）
              </Label>
              <Input
                id="crawl_frequency"
                type="number"
                min={5}
                max={1440}
                value={editForm.crawl_frequency}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    crawl_frequency: parseInt(e.target.value) || 60,
                  })
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">
                描述（可选）
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateSource}
              disabled={!editForm.name || saving}
            >
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除 "{sourceToDelete?.name}" 吗？此操作将同时删除该源下的所有文章。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteSource}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WeChat MP QR Code Login Dialog */}
      <Dialog
        open={qrCodeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseQrCodeDialog();
            setLoginStatus("waiting");
          } else {
            setQrCodeDialogOpen(open);
          }
        }}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>微信公众平台授权</DialogTitle>
            <DialogDescription>使用微信扫描二维码授权</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-2">
            {qrCodeUrl ? (
              <>
                <div className="rounded border bg-white p-2">
                  <img
                    src={qrCodeUrl}
                    alt="Login QR Code"
                    className="h-40 w-40 object-contain"
                  />
                </div>
                <div className="mt-3 text-center text-sm">
                  {loginStatus === "waiting" && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      等待扫码...
                    </span>
                  )}
                  {loginStatus === "scanned" && (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      已扫码，请确认
                    </span>
                  )}
                  {loginStatus === "confirmed" && (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCheck className="h-3.5 w-3.5" />
                      授权成功
                    </span>
                  )}
                  {loginStatus === "expired" && (
                    <div className="space-y-2">
                      <span className="flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        二维码已过期
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGetQRCode}
                        disabled={qrCodeLoading}
                      >
                        {qrCodeLoading ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        刷新
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            需要微信公众号管理员账号
          </p>
        </DialogContent>
      </Dialog>

      {/* Source Detail Sheet (查看公众号最近文章) */}
      <SourceDetailSheet
        source={selectedSource}
        open={sourceDetailOpen}
        onOpenChange={setSourceDetailOpen}
      />

      {/* Article Detail Sheet */}
      <Sheet open={articleSheetOpen} onOpenChange={setArticleSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedArticle && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedArticle.source_name}</span>
                  {selectedArticle.author && <span>· {selectedArticle.author}</span>}
                  <span>· {formatDate(selectedArticle.pub_date)}</span>
                </div>
                <SheetTitle className="text-left text-lg leading-snug">
                  {selectedArticle.title}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStar(selectedArticle.id)}
                  >
                    {selectedArticle.read_status === "starred" ? (
                      <>
                        <Star className="mr-1.5 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        取消收藏
                      </>
                    ) : (
                      <>
                        <StarOff className="mr-1.5 h-3.5 w-3.5" />
                        收藏
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedArticle.link, "_blank")}
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    查看原文
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {selectedArticle.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                  ) : selectedArticle.description ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedArticle.description,
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      暂无内容，请点击"查看原文"阅读
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
