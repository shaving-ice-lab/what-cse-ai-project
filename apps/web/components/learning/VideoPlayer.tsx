"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  SkipBack,
  SkipForward,
  AlertCircle,
  Bookmark,
  MessageSquare,
} from "lucide-react";

// 播放速率选项
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

// 清晰度选项
interface QualityOption {
  label: string;
  value: string;
  src: string;
}

// 视频笔记
interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  qualities?: QualityOption[];
  initialTime?: number;
  autoPlay?: boolean;
  onProgress?: (time: number, duration: number) => void;
  onComplete?: () => void;
  onNoteAdd?: (note: Omit<VideoNote, "id" | "createdAt">) => void;
  notes?: VideoNote[];
  enableAntiCheat?: boolean;
  antiCheatInterval?: number;
  className?: string;
}

// 格式化时间
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  title,
  qualities,
  initialTime = 0,
  autoPlay = false,
  onProgress,
  onComplete,
  onNoteAdd,
  notes = [],
  enableAntiCheat = false,
  antiCheatInterval = 300,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // 控制状态
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(qualities?.[0]?.value || "");

  // 其他状态
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [showAntiCheatDialog, setShowAntiCheatDialog] = useState(false);

  // 控制显示计时器
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const antiCheatRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = () => {
      setError("视频加载失败，请稍后重试");
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [initialTime, onProgress, onComplete]);

  // 防挂机检测
  useEffect(() => {
    if (!enableAntiCheat || !isPlaying) {
      if (antiCheatRef.current) {
        clearTimeout(antiCheatRef.current);
      }
      return;
    }

    antiCheatRef.current = setTimeout(() => {
      videoRef.current?.pause();
      setIsPlaying(false);
      setShowAntiCheatDialog(true);
    }, antiCheatInterval * 1000);

    return () => {
      if (antiCheatRef.current) {
        clearTimeout(antiCheatRef.current);
      }
    };
  }, [enableAntiCheat, antiCheatInterval, isPlaying, currentTime]);

  // 控制条自动隐藏
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => setShowControls(false));
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", () => setShowControls(false));
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 静音切换
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // 音量调节
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // 进度跳转
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const progress = progressRef.current;
      if (!video || !progress) return;

      const rect = progress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * duration;
    },
    [duration]
  );

  // 快进/快退
  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  // 播放速率
  const handleRateChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 画中画切换
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (err) {
      console.error("画中画不可用:", err);
    }
  }, []);

  // 清晰度切换
  const handleQualityChange = useCallback(
    (quality: string) => {
      const video = videoRef.current;
      const qualityOption = qualities?.find((q) => q.value === quality);
      if (!video || !qualityOption) return;

      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      video.src = qualityOption.src;
      video.currentTime = currentTime;
      setSelectedQuality(quality);

      if (wasPlaying) {
        video.play();
      }
      setShowSettings(false);
    },
    [qualities]
  );

  // 添加笔记
  const handleAddNote = useCallback(() => {
    if (!noteContent.trim()) return;

    onNoteAdd?.({
      timestamp: currentTime,
      content: noteContent.trim(),
    });
    setNoteContent("");
    setShowNoteInput(false);
  }, [noteContent, currentTime, onNoteAdd]);

  // 确认继续观看
  const handleConfirmWatching = useCallback(() => {
    setShowAntiCheatDialog(false);
    videoRef.current?.play();
    setIsPlaying(true);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "arrowleft":
          skip(-10);
          break;
        case "arrowright":
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange({
            target: { value: Math.min(1, volume + 0.1).toString() },
          } as React.ChangeEvent<HTMLInputElement>);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange({
            target: { value: Math.max(0, volume - 0.1).toString() },
          } as React.ChangeEvent<HTMLInputElement>);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, handleVolumeChange, volume]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden group",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
        className
      )}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* 加载中 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white text-lg">{error}</p>
        </div>
      )}

      {/* 中央播放按钮 */}
      {!isPlaying && !isLoading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg hover:bg-amber-500 transition-colors">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* 标题 */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

      {/* 笔记标记点 */}
      {notes.length > 0 && (
        <div className="absolute bottom-[76px] left-4 right-4 h-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="absolute w-2 h-2 bg-amber-500 rounded-full transform -translate-x-1/2 cursor-pointer hover:scale-150 transition-transform"
              style={{ left: `${(note.timestamp / duration) * 100}%` }}
              title={note.content}
            />
          ))}
        </div>
      )}

      {/* 控制条 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* 进度条 */}
        <div
          ref={progressRef}
          className="relative h-1.5 bg-white/30 rounded-full cursor-pointer group/progress mb-4"
          onClick={handleProgressClick}
        >
          {/* 缓冲进度 */}
          <div
            className="absolute h-full bg-white/50 rounded-full"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* 播放进度 */}
          <div
            className="absolute h-full bg-amber-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* 拖动手柄 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 播放/暂停 */}
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-amber-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* 快退 */}
            <button
              onClick={() => skip(-10)}
              className="p-2 text-white hover:text-amber-400 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* 快进 */}
            <button
              onClick={() => skip(10)}
              className="p-2 text-white hover:text-amber-400 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* 音量 */}
            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 text-white hover:text-amber-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-amber-500"
              />
            </div>

            {/* 时间 */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 添加笔记 */}
            {onNoteAdd && (
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="p-2 text-white hover:text-amber-400 transition-colors"
                title="添加笔记"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}

            {/* 设置 */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white hover:text-amber-400 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* 设置面板 */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-stone-900 rounded-lg shadow-xl p-3 min-w-[160px]">
                  {/* 播放速率 */}
                  <div className="mb-3">
                    <p className="text-xs text-stone-400 mb-2">播放速度</p>
                    <div className="flex flex-wrap gap-1">
                      {PLAYBACK_RATES.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleRateChange(rate)}
                          className={cn(
                            "px-2 py-1 text-xs rounded transition-colors",
                            playbackRate === rate
                              ? "bg-amber-500 text-white"
                              : "bg-stone-800 text-white hover:bg-stone-700"
                          )}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 清晰度 */}
                  {qualities && qualities.length > 0 && (
                    <div>
                      <p className="text-xs text-stone-400 mb-2">清晰度</p>
                      <div className="flex flex-col gap-1">
                        {qualities.map((quality) => (
                          <button
                            key={quality.value}
                            onClick={() => handleQualityChange(quality.value)}
                            className={cn(
                              "px-2 py-1 text-xs rounded text-left transition-colors",
                              selectedQuality === quality.value
                                ? "bg-amber-500 text-white"
                                : "bg-stone-800 text-white hover:bg-stone-700"
                            )}
                          >
                            {quality.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 画中画 */}
            <button
              onClick={togglePiP}
              className={cn(
                "p-2 transition-colors",
                isPiP ? "text-amber-400" : "text-white hover:text-amber-400"
              )}
              title="画中画"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-amber-400 transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 笔记输入框 */}
      {showNoteInput && (
        <div className="absolute bottom-24 left-4 right-4 bg-stone-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="text-white text-sm">
              在 {formatTime(currentTime)} 添加笔记
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="输入笔记内容..."
              className="flex-1 px-3 py-2 bg-stone-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            />
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 防挂机确认对话框 */}
      {showAntiCheatDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="bg-stone-900 rounded-xl p-6 max-w-sm mx-4 text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">
              确认继续观看？
            </h3>
            <p className="text-stone-400 text-sm mb-4">
              检测到您可能已离开，点击按钮继续学习
            </p>
            <button
              onClick={handleConfirmWatching}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              继续观看
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
