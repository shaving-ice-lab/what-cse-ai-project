"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Check,
  X,
  Sparkles,
  Gift,
  Clock,
  Shield,
  Zap,
  Star,
  ChevronRight,
  CreditCard,
  History,
  BadgeCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  membershipApi,
  MembershipPlan,
  MembershipOrder,
  VIPComparisonResponse,
  VIPStatusResponse,
  formatPrice,
  getOrderStatusText,
} from "@/services/api";

// ============================================
// VIP Status Card Component
// ============================================

interface VIPStatusCardProps {
  status: VIPStatusResponse | null;
  loading: boolean;
}

function VIPStatusCard({ status, loading }: VIPStatusCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-8 w-32 bg-white/20 rounded mb-4" />
        <div className="h-4 w-48 bg-white/20 rounded" />
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const isVIP = status.is_vip;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 ${
        isVIP
          ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white"
          : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-800"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-xl ${isVIP ? "bg-white/20" : "bg-stone-300/50"}`}
          >
            <Crown className={`w-6 h-6 ${isVIP ? "text-white" : "text-stone-600"}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{status.level_name}</h2>
            <p className={`text-sm ${isVIP ? "text-amber-100" : "text-stone-500"}`}>
              {status.status_name}
            </p>
          </div>
        </div>

        {isVIP ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-100" />
              <span className="text-amber-100">
                剩余 <span className="font-bold text-white">{status.days_remaining}</span> 天
              </span>
            </div>
            {status.expire_at && (
              <p className="text-sm text-amber-100">
                到期时间：{new Date(status.expire_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-stone-500">开通VIP，解锁全部高级功能</p>
        )}

        {!isVIP && (
          <button className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
            立即开通VIP
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Feature Comparison Component
// ============================================

interface FeatureComparisonProps {
  comparison: VIPComparisonResponse | null;
  loading: boolean;
}

function FeatureComparison({ comparison, loading }: FeatureComparisonProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
        <div className="h-6 w-32 bg-stone-200 rounded mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!comparison) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          VIP权益对比
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50">
              <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">
                功能权益
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-stone-500 w-28">
                普通用户
              </th>
              <th className="text-center px-4 py-4 text-sm font-medium text-amber-600 w-28 bg-amber-50/50">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4" />
                  VIP
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.normal_features.map((feature, index) => (
              <tr key={feature.code} className="border-t border-stone-100">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-stone-800">{feature.name}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{feature.description}</p>
                  </div>
                </td>
                <td className="text-center px-4 py-4">
                  {feature.available ? (
                    <span className="text-sm text-stone-600">{feature.limit}</span>
                  ) : (
                    <X className="w-5 h-5 text-stone-300 mx-auto" />
                  )}
                </td>
                <td className="text-center px-4 py-4 bg-amber-50/30">
                  {comparison.vip_features[index]?.available ? (
                    comparison.vip_features[index]?.limit === "无限制" ? (
                      <Check className="w-5 h-5 text-amber-500 mx-auto" />
                    ) : (
                      <span className="text-sm text-amber-600 font-medium">
                        {comparison.vip_features[index]?.limit}
                      </span>
                    )
                  ) : (
                    <X className="w-5 h-5 text-stone-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Plan Card Component
// ============================================

interface PlanCardProps {
  plan: MembershipPlan;
  selected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const discount = plan.original_price > plan.price
    ? Math.round((1 - plan.price / plan.original_price) * 100)
    : 0;

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
        selected
          ? "border-amber-500 bg-amber-50/50 shadow-amber-md"
          : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-card"
      }`}
    >
      {plan.is_recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
          推荐
        </div>
      )}

      {discount > 0 && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
          -{discount}%
        </div>
      )}

      <div className="text-center">
        <h4 className="font-semibold text-stone-800">{plan.name}</h4>
        <p className="text-sm text-stone-500 mt-1">{plan.duration}天</p>

        <div className="mt-4">
          <span className="text-3xl font-bold text-amber-600">
            {formatPrice(plan.price)}
          </span>
          {plan.original_price > plan.price && (
            <span className="ml-2 text-sm text-stone-400 line-through">
              {formatPrice(plan.original_price)}
            </span>
          )}
        </div>

        {plan.description && (
          <p className="mt-3 text-xs text-stone-500">{plan.description}</p>
        )}
      </div>

      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? "border-amber-500 bg-amber-500"
            : "border-stone-300"
        }`}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  );
}

// ============================================
// Order History Component
// ============================================

interface OrderHistoryProps {
  orders: MembershipOrder[];
  loading: boolean;
}

function OrderHistory({ orders, loading }: OrderHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 mx-auto text-stone-200 mb-3" />
        <p className="text-stone-500">暂无订单记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800">{order.plan_name}</h4>
              <div className="flex items-center gap-2 text-sm text-stone-500 mt-0.5">
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                <span>·</span>
                <span>{order.duration}天</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-stone-800">{formatPrice(order.amount)}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                order.payment_status === 1
                  ? "bg-green-100 text-green-700"
                  : order.payment_status === 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              {getOrderStatusText(order.payment_status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function VIPMembershipPage() {
  const [loading, setLoading] = useState(true);
  const [vipStatus, setVipStatus] = useState<VIPStatusResponse | null>(null);
  const [comparison, setComparison] = useState<VIPComparisonResponse | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [orders, setOrders] = useState<MembershipOrder[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "orders">("plans");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, comparisonRes, plansRes, ordersRes] = await Promise.all([
        membershipApi.getVIPStatus().catch(() => null),
        membershipApi.getVIPComparison(),
        membershipApi.getPlans(),
        membershipApi.getOrders({ page: 1, page_size: 10 }).catch(() => ({ orders: [] })),
      ]);

      setVipStatus(statusRes);
      setComparison(comparisonRes);
      setPlans(plansRes.plans || []);
      setOrders(ordersRes.orders || []);

      // Auto-select recommended plan
      const recommended = plansRes.plans?.find((p) => p.is_recommended);
      if (recommended) {
        setSelectedPlanId(recommended.id);
      } else if (plansRes.plans?.length > 0) {
        setSelectedPlanId(plansRes.plans[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePurchase = async () => {
    if (!selectedPlanId) return;

    setPurchasing(true);
    try {
      // Create order
      const order = await membershipApi.createOrder(selectedPlanId);
      
      // Simulate payment (in production, this would redirect to payment gateway)
      await membershipApi.payOrder(order.order_no);
      
      // Refresh data
      await fetchData();
      
      alert("开通成功！");
    } catch (error) {
      console.error("Failed to purchase:", error);
      alert("开通失败，请稍后重试");
    } finally {
      setPurchasing(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-2">
          <Crown className="w-7 h-7 text-amber-500" />
          VIP会员
        </h1>
        <p className="text-stone-500 mt-1">解锁全部高级功能，享受更好的备考体验</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* VIP Status Card */}
          <VIPStatusCard status={vipStatus} loading={loading} />

          {/* VIP Benefits Quick List */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              VIP专属特权
            </h3>
            <div className="space-y-3">
              {[
                { icon: Zap, text: "职位对比分析", desc: "多维度对比职位" },
                { icon: History, text: "历年数据查看", desc: "完整历年分数线" },
                { icon: Shield, text: "报名大数据", desc: "实时竞争分析" },
                { icon: Star, text: "智能匹配无限制", desc: "不限次数匹配" },
                { icon: BadgeCheck, text: "无广告体验", desc: "纯净浏览" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-700 text-sm">{item.text}</p>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feature Comparison */}
          <FeatureComparison comparison={comparison} loading={loading} />

          {/* Plans / Orders Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
            <div className="flex border-b border-stone-100">
              <button
                onClick={() => setActiveTab("plans")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "plans"
                    ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50/50"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                开通VIP
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "orders"
                    ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50/50"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                订单记录
              </button>
            </div>

            <div className="p-6">
              {activeTab === "plans" ? (
                <div className="space-y-6">
                  {/* Plan Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        selected={selectedPlanId === plan.id}
                        onSelect={() => setSelectedPlanId(plan.id)}
                      />
                    ))}
                  </div>

                  {plans.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto text-stone-200 mb-3" />
                      <p className="text-stone-500">暂无可用套餐</p>
                    </div>
                  )}

                  {/* Purchase Button */}
                  {plans.length > 0 && (
                    <div className="pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-stone-500">已选套餐</p>
                          <p className="font-medium text-stone-800">
                            {selectedPlan?.name || "请选择套餐"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500">应付金额</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {selectedPlan ? formatPrice(selectedPlan.price) : "¥0.00"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handlePurchase}
                        disabled={!selectedPlanId || purchasing || (vipStatus?.is_vip ?? false)}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            处理中...
                          </>
                        ) : vipStatus?.is_vip ? (
                          "您已是VIP会员"
                        ) : (
                          <>
                            <Crown className="w-5 h-5" />
                            立即开通
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-stone-400 mt-3">
                        开通即表示同意
                        <Link href="/terms" className="text-amber-600 hover:underline">
                          《VIP会员服务协议》
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <OrderHistory orders={orders} loading={loading} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
