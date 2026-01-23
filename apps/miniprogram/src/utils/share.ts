import Taro from "@tarojs/taro";

export interface ShareOptions {
  title: string;
  path: string;
  imageUrl?: string;
}

export function useShare(options: ShareOptions) {
  Taro.useShareAppMessage(() => ({
    title: options.title,
    path: options.path,
    imageUrl: options.imageUrl,
  }));

  Taro.useShareTimeline(() => ({
    title: options.title,
    path: options.path,
    imageUrl: options.imageUrl,
  }));
}

export function sharePosition(id: number, name: string) {
  return {
    title: `推荐职位：${name}`,
    path: `/subpackages/positions/detail?id=${id}`,
  };
}

export function shareAnnouncement(id: number, title: string) {
  return {
    title: title,
    path: `/subpackages/announcements/detail?id=${id}`,
  };
}
