import Taro from "@tarojs/taro";

export interface ShareConfig {
  title: string;
  path: string;
  imageUrl?: string;
}

export interface PositionShareData {
  id: number;
  name: string;
  department: string;
  location: string;
  salary?: string;
}

export const shareUtils = {
  sharePosition(position: PositionShareData): ShareConfig {
    const title = `${position.department} - ${position.name}`;
    const path = `/pages/positions/detail?id=${position.id}`;
    return {
      title,
      path,
      imageUrl: "",
    };
  },

  shareAnnouncement(announcement: { id: number; title: string }): ShareConfig {
    return {
      title: announcement.title,
      path: `/subpackages/announcements/detail?id=${announcement.id}`,
    };
  },

  shareMatchReport(userId: number): ShareConfig {
    return {
      title: "我的公考职位匹配报告",
      path: `/subpackages/match/report?userId=${userId}`,
    };
  },

  async generateSharePoster(position: PositionShareData): Promise<string> {
    const canvasId = "shareCanvas";
    const ctx = Taro.createCanvasContext(canvasId);

    ctx.setFillStyle("#ffffff");
    ctx.fillRect(0, 0, 375, 600);

    ctx.setFillStyle("#1890ff");
    ctx.fillRect(0, 0, 375, 120);

    ctx.setFillStyle("#ffffff");
    ctx.setFontSize(20);
    ctx.fillText(position.department, 20, 50);

    ctx.setFontSize(16);
    ctx.fillText(position.name, 20, 80);

    ctx.setFillStyle("#333333");
    ctx.setFontSize(14);
    ctx.fillText(`工作地点: ${position.location}`, 20, 160);

    if (position.salary) {
      ctx.fillText(`薪资待遇: ${position.salary}`, 20, 190);
    }

    ctx.setFillStyle("#999999");
    ctx.setFontSize(12);
    ctx.fillText("扫描小程序码查看详情", 20, 550);

    return new Promise((resolve, reject) => {
      ctx.draw(false, () => {
        setTimeout(() => {
          Taro.canvasToTempFilePath({
            canvasId,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err),
          });
        }, 100);
      });
    });
  },

  async saveToAlbum(imagePath: string): Promise<boolean> {
    try {
      await Taro.saveImageToPhotosAlbum({ filePath: imagePath });
      Taro.showToast({ title: "保存成功", icon: "success" });
      return true;
    } catch (error: any) {
      if (error.errMsg?.includes("auth deny")) {
        const res = await Taro.showModal({
          title: "提示",
          content: "需要您授权保存图片到相册",
          confirmText: "去授权",
        });
        if (res.confirm) {
          Taro.openSetting();
        }
      } else {
        Taro.showToast({ title: "保存失败", icon: "none" });
      }
      return false;
    }
  },

  copyLink(path: string): void {
    const baseUrl = "https://gongkao.example.com";
    Taro.setClipboardData({
      data: `${baseUrl}${path}`,
      success: () => {
        Taro.showToast({ title: "链接已复制", icon: "success" });
      },
    });
  },
};

export function useShareConfig(config: ShareConfig) {
  Taro.useShareAppMessage(() => ({
    title: config.title,
    path: config.path,
    imageUrl: config.imageUrl,
  }));

  Taro.useShareTimeline(() => ({
    title: config.title,
    path: config.path,
    imageUrl: config.imageUrl,
  }));
}
