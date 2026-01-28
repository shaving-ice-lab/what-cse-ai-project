"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  MoreHorizontal,
  Gift,
  Ban,
  Search,
  RefreshCw,
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Skeleton,
} from "@what-cse/ui";
import {
  membershipApi,
  UserMembership,
  MembershipPlan,
  MembershipOrder,
  VIPFeature,
  MembershipStats,
  OrderStats,
  getMembershipLevelText,
  getMembershipStatusText,
  getOrderStatusText,
  formatPrice,
} from "@/services/membership-api";

// ============================================
// Stats Cards Component
// ============================================

interface StatsCardsProps {
  membershipStats?: MembershipStats;
  orderStats?: OrderStats;
  loading: boolean;
}

function StatsCards({ membershipStats, orderStats, loading }: StatsCardsProps) {
  const stats = [
    {
      title: "活跃VIP会员",
      value: membershipStats?.active_vip_count || 0,
      icon: Crown,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "本月新增VIP",
      value: membershipStats?.month_new_vip || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "即将到期",
      value: membershipStats?.expiring_count || 0,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      description: "7天内",
    },
    {
      title: "本月收入",
      value: orderStats ? formatPrice(orderStats.month_revenue) : "¥0.00",
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      isString: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.isString ? stat.value : stat.value.toLocaleString()}
            </div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Membership List Component
// ============================================

interface MembershipListProps {
  memberships: UserMembership[];
  loading: boolean;
  onActivate: (userId: number) => void;
  onDeactivate: (userId: number) => void;
}

function MembershipList({ memberships, loading, onActivate, onDeactivate }: MembershipListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无会员数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户</TableHead>
            <TableHead>会员等级</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>到期时间</TableHead>
            <TableHead>累计天数</TableHead>
            <TableHead>来源</TableHead>
            <TableHead className="w-[80px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        membership.user?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${membership.user?.nickname || "U"}`
                      }
                      alt={membership.user?.nickname || "用户"}
                    />
                    <AvatarFallback>
                      {(membership.user?.nickname || "U").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{membership.user?.nickname || "未知用户"}</p>
                    <p className="text-xs text-muted-foreground">
                      {membership.user?.phone || membership.user?.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={membership.level === 1 ? "default" : "secondary"}
                  className={membership.level === 1 ? "bg-amber-500" : ""}
                >
                  {membership.level === 1 && <Crown className="h-3 w-3 mr-1" />}
                  {getMembershipLevelText(membership.level)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    membership.status === 1
                      ? "default"
                      : membership.status === 2
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {getMembershipStatusText(membership.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {membership.expire_at
                  ? new Date(membership.expire_at).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{membership.total_days}天</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {membership.source === "purchase"
                    ? "购买"
                    : membership.source === "gift"
                      ? "赠送"
                      : membership.source === "promotion"
                        ? "活动"
                        : membership.source || "-"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onActivate(membership.user_id)}>
                      <Gift className="mr-2 h-4 w-4" />
                      赠送VIP
                    </DropdownMenuItem>
                    {membership.level === 1 && membership.status === 1 && (
                      <DropdownMenuItem
                        onClick={() => onDeactivate(membership.user_id)}
                        className="text-destructive"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        取消VIP
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// Plans List Component
// ============================================

interface PlansListProps {
  plans: MembershipPlan[];
  loading: boolean;
  onEdit: (plan: MembershipPlan) => void;
  onDelete: (id: number) => void;
}

function PlansList({ plans, loading, onEdit, onDelete }: PlansListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无套餐</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className={!plan.is_enabled ? "opacity-60" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {plan.is_recommended && (
                    <Badge variant="default" className="bg-amber-500">
                      推荐
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.duration}天</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(plan)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(plan.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                {plan.original_price > plan.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(plan.original_price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant={plan.is_enabled ? "default" : "secondary"}>
                  {plan.is_enabled ? "已启用" : "已禁用"}
                </Badge>
                <span className="text-xs text-muted-foreground">编码: {plan.code}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Orders List Component
// ============================================

interface OrdersListProps {
  orders: MembershipOrder[];
  loading: boolean;
}

function OrdersList({ orders, loading }: OrdersListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无订单</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>订单号</TableHead>
            <TableHead>用户</TableHead>
            <TableHead>套餐</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>支付方式</TableHead>
            <TableHead>创建时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.order_no}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {(order.user?.nickname || "U").slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{order.user?.nickname || "未知用户"}</span>
                </div>
              </TableCell>
              <TableCell>{order.plan_name}</TableCell>
              <TableCell className="font-medium">{formatPrice(order.amount)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.payment_status === 1
                      ? "default"
                      : order.payment_status === 3
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {getOrderStatusText(order.payment_status)}
                </Badge>
              </TableCell>
              <TableCell>{order.payment_method || "-"}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// Features List Component
// ============================================

interface FeaturesListProps {
  features: VIPFeature[];
  loading: boolean;
}

function FeaturesList({ features, loading }: FeaturesListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>功能名称</TableHead>
            <TableHead>功能编码</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>VIP专属</TableHead>
            <TableHead>普通用户限制</TableHead>
            <TableHead>VIP用户限制</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.code}>
              <TableCell className="font-medium">{feature.name}</TableCell>
              <TableCell className="font-mono text-sm">{feature.code}</TableCell>
              <TableCell className="text-muted-foreground">{feature.description}</TableCell>
              <TableCell>
                {feature.is_vip_only ? (
                  <Check className="h-4 w-4 text-amber-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
              <TableCell>
                {feature.free_limit === -1
                  ? "无限制"
                  : feature.free_limit === 0
                    ? "不可用"
                    : `${feature.free_limit}次/天`}
              </TableCell>
              <TableCell>
                {feature.vip_limit === -1 ? "无限制" : `${feature.vip_limit}次/天`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// Activate VIP Dialog
// ============================================

interface ActivateVIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (days: number, source: string) => void;
}

function ActivateVIPDialog({ open, onOpenChange, onSubmit }: ActivateVIPDialogProps) {
  const [days, setDays] = useState(30);
  const [source, setSource] = useState("gift");

  const handleSubmit = () => {
    onSubmit(days, source);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>赠送VIP会员</DialogTitle>
          <DialogDescription>为用户赠送VIP会员时长</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>赠送天数</Label>
            <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7天</SelectItem>
                <SelectItem value="30">30天</SelectItem>
                <SelectItem value="90">90天</SelectItem>
                <SelectItem value="180">180天</SelectItem>
                <SelectItem value="365">365天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>来源</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gift">管理员赠送</SelectItem>
                <SelectItem value="promotion">活动奖励</SelectItem>
                <SelectItem value="compensation">补偿</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>确认赠送</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function VIPManagementPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [membershipStats, setMembershipStats] = useState<MembershipStats | undefined>();
  const [orderStats, setOrderStats] = useState<OrderStats | undefined>();
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [orders, setOrders] = useState<MembershipOrder[]>([]);
  const [features, setFeatures] = useState<VIPFeature[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, membershipsRes, plansRes, ordersRes, featuresRes] = await Promise.all([
        membershipApi.getStats(),
        membershipApi.getMemberships({ page: 1, page_size: 50, keyword: searchTerm }),
        membershipApi.getPlans(),
        membershipApi.getOrders({ page: 1, page_size: 50 }),
        membershipApi.getFeatures(),
      ]);

      setMembershipStats(statsRes.membership);
      setOrderStats(statsRes.order);
      setMemberships(membershipsRes.memberships || []);
      setPlans(plansRes.plans || []);
      setOrders(ordersRes.orders || []);
      setFeatures(featuresRes.features || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleActivate = (userId: number) => {
    setSelectedUserId(userId);
    setActivateDialogOpen(true);
  };

  const handleActivateSubmit = async (days: number, source: string) => {
    if (!selectedUserId) return;
    try {
      await membershipApi.activateVIP(selectedUserId, { days, source });
      fetchData();
    } catch (error) {
      console.error("Failed to activate VIP:", error);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm("确定要取消该用户的VIP会员吗？")) return;
    try {
      await membershipApi.deactivateVIP(userId);
      fetchData();
    } catch (error) {
      console.error("Failed to deactivate VIP:", error);
    }
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    // TODO: Implement plan edit dialog
    console.log("Edit plan:", plan);
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("确定要删除该套餐吗？")) return;
    try {
      await membershipApi.deletePlan(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  };

  const filteredMemberships = memberships.filter((m) => {
    if (levelFilter === "all") return true;
    return m.level === Number(levelFilter);
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            VIP会员管理
          </h1>
          <p className="text-muted-foreground">管理会员等级、权益和订单</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <StatsCards
        membershipStats={membershipStats}
        orderStats={orderStats}
        loading={loading}
      />

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            会员列表
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Package className="h-4 w-4 mr-2" />
            套餐管理
          </TabsTrigger>
          <TabsTrigger value="orders">
            <DollarSign className="h-4 w-4 mr-2" />
            订单记录
          </TabsTrigger>
          <TabsTrigger value="features">
            <Crown className="h-4 w-4 mr-2" />
            权益配置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="会员等级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="0">普通用户</SelectItem>
                      <SelectItem value="1">VIP会员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MembershipList
                memberships={filteredMemberships}
                loading={loading}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>会员套餐</CardTitle>
                  <CardDescription>管理VIP会员套餐和定价</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  添加套餐
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PlansList
                plans={plans}
                loading={loading}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>订单记录</CardTitle>
              <CardDescription>查看所有会员订单</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersList orders={orders} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VIP权益配置</CardTitle>
              <CardDescription>查看和配置VIP专属功能和普通用户限制</CardDescription>
            </CardHeader>
            <CardContent>
              <FeaturesList features={features} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 激活VIP对话框 */}
      <ActivateVIPDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        onSubmit={handleActivateSubmit}
      />
    </div>
  );
}
