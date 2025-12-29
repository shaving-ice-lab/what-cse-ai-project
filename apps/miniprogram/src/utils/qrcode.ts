import Taro from "@tarojs/taro";

export interface QRCodeParams {
  type: "position" | "announcement" | "match" | "share";
  id?: number;
  userId?: number;
  extra?: Record<string, string>;
}

export function encodeQRParams(params: QRCodeParams): string {
  const parts: string[] = [`t=${params.type}`];

  if (params.id) {
    parts.push(`i=${params.id}`);
  }
  if (params.userId) {
    parts.push(`u=${params.userId}`);
  }
  if (params.extra) {
    Object.entries(params.extra).forEach(([key, value]) => {
      parts.push(`${key}=${value}`);
    });
  }

  return parts.join("&");
}

export function decodeQRParams(scene: string): QRCodeParams {
  const params: QRCodeParams = { type: "share" };

  try {
    const decoded = decodeURIComponent(scene);
    const pairs = decoded.split("&");

    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      switch (key) {
        case "t":
          params.type = value as QRCodeParams["type"];
          break;
        case "i":
          params.id = parseInt(value, 10);
          break;
        case "u":
          params.userId = parseInt(value, 10);
          break;
        default:
          if (!params.extra) params.extra = {};
          params.extra[key] = value;
      }
    });
  } catch (e) {
    console.error("Decode QR params error:", e);
  }

  return params;
}

export function getTargetPage(params: QRCodeParams): string {
  switch (params.type) {
    case "position":
      return `/subpackages/positions/detail?id=${params.id}`;
    case "announcement":
      return `/subpackages/announcements/detail?id=${params.id}`;
    case "match":
      return `/subpackages/match/index`;
    default:
      return "/pages/index/index";
  }
}

export function handleQRCodeLaunch(): void {
  const launchOptions = Taro.getLaunchOptionsSync();

  if (
    launchOptions.scene === 1047 ||
    launchOptions.scene === 1048 ||
    launchOptions.scene === 1049
  ) {
    const query = launchOptions.query;
    if (query?.scene) {
      const params = decodeQRParams(query.scene);
      const targetPage = getTargetPage(params);

      setTimeout(() => {
        Taro.navigateTo({ url: targetPage }).catch(() => {
          Taro.switchTab({ url: "/pages/index/index" });
        });
      }, 100);
    }
  }
}

export async function previewQRCode(imagePath: string): Promise<void> {
  await Taro.previewImage({
    urls: [imagePath],
    current: imagePath,
  });
}

export async function saveQRCode(imagePath: string): Promise<boolean> {
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
}
