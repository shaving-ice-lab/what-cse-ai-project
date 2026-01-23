import { View, Text, ScrollView } from "@tarojs/components";
import { useState, useCallback } from "react";
import "./index.scss";

interface RefreshListProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  emptyText?: string;
  isEmpty?: boolean;
}

export default function RefreshList({
  children,
  onRefresh,
  onLoadMore,
  hasMore = true,
  loading = false,
  emptyText = "暂无数据",
  isEmpty = false,
}: RefreshListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh]);

  const handleScrollToLower = useCallback(async () => {
    if (loading || !hasMore || !onLoadMore) return;
    await onLoadMore();
  }, [loading, hasMore, onLoadMore]);

  return (
    <ScrollView
      className="refresh-list"
      scrollY
      refresherEnabled={!!onRefresh}
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
      onScrollToLower={handleScrollToLower}
      lowerThreshold={100}
    >
      {isEmpty ? (
        <View className="empty-state">
          <Text className="empty-text">{emptyText}</Text>
        </View>
      ) : (
        <>
          {children}
          {hasMore && (
            <View className="load-more">
              <Text>{loading ? "加载中..." : "上拉加载更多"}</Text>
            </View>
          )}
          {!hasMore && (
            <View className="no-more">
              <Text>没有更多了</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
