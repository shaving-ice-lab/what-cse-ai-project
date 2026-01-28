import { useState, useCallback } from "react";
import {
  subscriptionApi,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscribeTypeOption,
  NotifyChannelOption,
} from "@/services/api/subscription";
import { toast } from "@what-cse/ui";

export function useSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>(
    []
  );
  const [total, setTotal] = useState(0);

  const fetchSubscriptions = useCallback(
    async (page?: number, pageSize?: number) => {
      setLoading(true);
      try {
        const result = await subscriptionApi.list(page, pageSize);
        setSubscriptions(result.subscriptions);
        setTotal(result.total);
        return result;
      } catch (error) {
        toast.error("获取订阅列表失败");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createSubscription = useCallback(
    async (data: CreateSubscriptionRequest) => {
      try {
        const subscription = await subscriptionApi.create(data);
        setSubscriptions((prev) => [subscription, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success("订阅创建成功");
        return subscription;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "创建订阅失败";
        if (message.includes("exists")) {
          toast.error("该订阅已存在");
        } else {
          toast.error(message);
        }
        throw error;
      }
    },
    []
  );

  const updateSubscription = useCallback(
    async (id: number, data: UpdateSubscriptionRequest) => {
      try {
        await subscriptionApi.update(id, data);
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...data } : s))
        );
        toast.success("订阅更新成功");
        return true;
      } catch (error) {
        toast.error("更新订阅失败");
        return false;
      }
    },
    []
  );

  const toggleSubscription = useCallback(async (id: number) => {
    try {
      await subscriptionApi.toggle(id);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_enabled: !s.is_enabled } : s))
      );
      toast.success("订阅状态已更新");
      return true;
    } catch (error) {
      toast.error("更新订阅状态失败");
      return false;
    }
  }, []);

  const deleteSubscription = useCallback(async (id: number) => {
    try {
      await subscriptionApi.delete(id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
      toast.success("订阅已删除");
      return true;
    } catch (error) {
      toast.error("删除订阅失败");
      return false;
    }
  }, []);

  return {
    loading,
    subscriptions,
    total,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    toggleSubscription,
    deleteSubscription,
  };
}

export function useSubscriptionTypes() {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<SubscribeTypeOption[]>([]);
  const [channels, setChannels] = useState<NotifyChannelOption[]>([]);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await subscriptionApi.getTypes();
      setTypes(result.types);
      setChannels(result.channels);
      return result;
    } catch (error) {
      // Use defaults if API fails
      setTypes([
        { value: "exam_type", label: "考试类型", description: "订阅特定考试类型" },
        { value: "province", label: "省份", description: "订阅特定省份" },
        { value: "city", label: "城市", description: "订阅特定城市" },
        { value: "keyword", label: "关键词", description: "订阅包含关键词的职位" },
        { value: "department", label: "部门", description: "订阅特定部门" },
        { value: "education", label: "学历", description: "订阅特定学历要求" },
        { value: "major", label: "专业", description: "订阅特定专业要求" },
      ]);
      setChannels([
        { value: "push", label: "站内推送", description: "站内消息推送" },
        { value: "email", label: "邮件", description: "邮件通知" },
      ]);
      return { types, channels };
    } finally {
      setLoading(false);
    }
  }, [types, channels]);

  return {
    loading,
    types,
    channels,
    fetchTypes,
  };
}
