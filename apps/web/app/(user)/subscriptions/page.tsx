"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Trash2,
  Settings,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { useSubscriptions, useSubscriptionTypes } from "@/hooks/useSubscription";
import {
  SubscriptionResponse,
  SubscribeType,
  NotifyChannel,
  CreateSubscriptionRequest,
} from "@/services/api/subscription";

// 订阅类型配置
const typeIcons: Record<SubscribeType, string> = {
  exam_type: "📝",
  province: "🗺️",
  city: "🏙️",
  keyword: "🔍",
  department: "🏛️",
  education: "🎓",
  major: "📚",
};

const channelIcons: Record<NotifyChannel, typeof Bell> = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  wechat: Send,
};

export default function SubscriptionsPage() {
  const {
    loading,
    subscriptions,
    total,
    fetchSubscriptions,
    createSubscription,
    toggleSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const { types, channels, fetchTypes } = useSubscriptionTypes();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionRequest>({
    subscribe_type: "province",
    subscribe_value: "",
    subscribe_name: "",
    notify_on_new: true,
    notify_channels: ["push"],
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchTypes();
  }, [fetchSubscriptions, fetchTypes]);

  const handleSubmit = async () => {
    if (!formData.subscribe_value || !formData.subscribe_name) {
      return;
    }
    try {
      await createSubscription(formData);
      setShowModal(false);
      setFormData({
        subscribe_type: "province",
        subscribe_value: "",
        subscribe_name: "",
        notify_on_new: true,
        notify_channels: ["push"],
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (subscription: SubscriptionResponse) => {
    if (confirm(`确定要删除订阅"${subscription.subscribe_name}"吗？`)) {
      await deleteSubscription(subscription.id);
    }
  };

  const handleToggle = async (subscription: SubscriptionResponse) => {
    await toggleSubscription(subscription.id);
  };

  const toggleChannel = (channel: NotifyChannel) => {
    setFormData((prev) => {
      const channels = prev.notify_channels || [];
      if (channels.includes(channel)) {
        return {
          ...prev,
          notify_channels: channels.filter((c) => c !== channel),
        };
      } else {
        return {
          ...prev,
          notify_channels: [...channels, channel],
        };
      }
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/favorites" className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
              <Bell className="w-8 h-8 text-amber-500" />
              订阅管理
            </h1>
            <p className="text-stone-500 mt-1">管理您的职位订阅，第一时间获取新职位通知</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
        >
          <Plus className="w-5 h-5" />
          <span>添加订阅</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center">
          <div className="text-2xl font-bold text-stone-800">{total}</div>
          <div className="text-sm text-stone-500">订阅总数</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {subscriptions.filter((s) => s.is_enabled).length}
          </div>
          <div className="text-sm text-stone-500">已启用</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {subscriptions.filter((s) => !s.is_enabled).length}
          </div>
          <div className="text-sm text-stone-500">已暂停</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200/50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {subscriptions.filter((s) => s.notify_on_new).length}
          </div>
          <div className="text-sm text-stone-500">新公告通知</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Subscriptions List */}
      {!loading && subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription, index) => (
            <div
              key={subscription.id}
              className={`bg-white rounded-2xl border shadow-card transition-all duration-300 overflow-hidden animate-fade-in ${
                subscription.is_enabled ? "border-stone-200/50" : "border-stone-200/50 opacity-60"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center text-2xl bg-amber-50 rounded-xl">
                    {typeIcons[subscription.subscribe_type] || "📌"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-stone-800">
                        {subscription.subscribe_name}
                      </h3>
                      {!subscription.is_enabled && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-stone-100 text-stone-500">
                          已暂停
                        </span>
                      )}
                    </div>

                    {/* Type and Value */}
                    <p className="text-sm text-stone-500 mb-3">
                      {types.find((t) => t.value === subscription.subscribe_type)?.label ||
                        subscription.subscribe_type}
                      ：
                      <span className="text-stone-700 font-medium">
                        {subscription.subscribe_value}
                      </span>
                    </p>

                    {/* Notify Channels */}
                    <div className="flex flex-wrap items-center gap-2">
                      {subscription.notify_channels.map((channel) => {
                        const Icon = channelIcons[channel] || Bell;
                        return (
                          <span
                            key={channel}
                            className="flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-lg text-xs text-stone-600"
                          >
                            <Icon className="w-3 h-3" />
                            {channels.find((c) => c.value === channel)?.label || channel}
                          </span>
                        );
                      })}
                      {subscription.notify_on_new && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-lg text-xs text-emerald-700">
                          <Check className="w-3 h-3" />
                          新公告通知
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(subscription)}
                      className={`p-2 rounded-lg transition-colors ${
                        subscription.is_enabled
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-stone-400 hover:bg-stone-50"
                      }`}
                      title={subscription.is_enabled ? "暂停订阅" : "启用订阅"}
                    >
                      {subscription.is_enabled ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(subscription)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除订阅"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Footer */}
                {subscription.last_notify_at && (
                  <div className="mt-4 pt-4 border-t border-stone-100 text-sm text-stone-500">
                    上次通知：{new Date(subscription.last_notify_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
            <Bell className="w-16 h-16 mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500 mb-2">暂无订阅</p>
            <p className="text-stone-400 text-sm mb-4">
              添加订阅后，当有新的职位或公告发布时，您将收到通知
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
            >
              <Plus className="w-5 h-5" />
              添加第一个订阅
            </button>
          </div>
        )
      )}

      {/* Add Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-stone-800">添加订阅</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Subscribe Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">订阅类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          subscribe_type: type.value,
                        }))
                      }
                      className={`p-3 rounded-xl text-left transition-colors ${
                        formData.subscribe_type === type.value
                          ? "bg-amber-50 border-2 border-amber-500"
                          : "bg-stone-50 border-2 border-transparent hover:border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeIcons[type.value] || "📌"}</span>
                        <div>
                          <div className="font-medium text-stone-800">{type.label}</div>
                          <div className="text-xs text-stone-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscribe Value */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">订阅值</label>
                <input
                  type="text"
                  value={formData.subscribe_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subscribe_value: e.target.value,
                    }))
                  }
                  placeholder={
                    formData.subscribe_type === "province"
                      ? "例如：北京、广东"
                      : formData.subscribe_type === "keyword"
                        ? "例如：计算机、财务"
                        : "请输入订阅值"
                  }
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Subscribe Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">显示名称</label>
                <input
                  type="text"
                  value={formData.subscribe_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subscribe_name: e.target.value,
                    }))
                  }
                  placeholder="例如：北京市职位、计算机相关"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Notify Channels */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">通知渠道</label>
                <div className="flex flex-wrap gap-2">
                  {channels.map((channel) => {
                    const Icon = channelIcons[channel.value] || Bell;
                    const isSelected = formData.notify_channels?.includes(channel.value);
                    return (
                      <button
                        key={channel.value}
                        onClick={() => toggleChannel(channel.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                            : "bg-stone-100 text-stone-600 border border-transparent hover:border-stone-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{channel.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notify On New */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-800">新公告通知</div>
                  <div className="text-xs text-stone-500">有新公告时发送通知</div>
                </div>
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      notify_on_new: !prev.notify_on_new,
                    }))
                  }
                  className={`p-1 rounded-full transition-colors ${
                    formData.notify_on_new
                      ? "bg-emerald-500 text-white"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {formData.notify_on_new ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-4 border-t border-stone-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.subscribe_value || !formData.subscribe_name}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加订阅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
