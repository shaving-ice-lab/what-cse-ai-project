import Taro from "@tarojs/taro";
import { storage } from "../utils/storage";

const PUSH_TOKEN_KEY = "push_token";
const PUSH_ENABLED_KEY = "push_enabled";

export interface PushMessage {
  title: string;
  content: string;
  extras?: Record<string, any>;
}

export interface PushConfig {
  appKey: string;
  channel?: string;
}

export const pushService = {
  pushToken: null as string | null,
  isInitialized: false,

  async init(config: PushConfig): Promise<void> {
    if (this.isInitialized) return;

    try {
      const env = Taro.getEnv();
      if (env === Taro.ENV_TYPE.RN) {
        await this.initJPush(config);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Push init error:", error);
    }
  },

  async initJPush(config: PushConfig): Promise<void> {
    // JPush integration placeholder
    // In actual implementation, use jpush-react-native package
    console.log("JPush init with config:", config);
  },

  async getRegistrationID(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;

    const storedToken = storage.get<string>(PUSH_TOKEN_KEY);
    if (storedToken) {
      this.pushToken = storedToken;
      return storedToken;
    }

    return null;
  },

  async uploadPushToken(userId: number): Promise<void> {
    const token = await this.getRegistrationID();
    if (!token) return;

    try {
      await Taro.request({
        url: "http://localhost:9000/api/v1/user/push-token",
        method: "POST",
        data: {
          userId,
          token,
          platform: Taro.getEnv() === Taro.ENV_TYPE.RN ? "app" : "miniprogram",
        },
      });
    } catch (error) {
      console.error("Upload push token error:", error);
    }
  },

  savePushToken(token: string): void {
    this.pushToken = token;
    storage.set(PUSH_TOKEN_KEY, token);
  },

  isPushEnabled(): boolean {
    return storage.get<boolean>(PUSH_ENABLED_KEY) ?? true;
  },

  setPushEnabled(enabled: boolean): void {
    storage.set(PUSH_ENABLED_KEY, enabled);
    if (!enabled) {
      this.stopPush();
    } else {
      this.resumePush();
    }
  },

  stopPush(): void {
    console.log("Push stopped");
  },

  resumePush(): void {
    console.log("Push resumed");
  },

  setAlias(alias: string): void {
    console.log("Set alias:", alias);
  },

  deleteAlias(): void {
    console.log("Delete alias");
  },

  setTags(tags: string[]): void {
    console.log("Set tags:", tags);
  },

  addTags(tags: string[]): void {
    console.log("Add tags:", tags);
  },

  deleteTags(tags: string[]): void {
    console.log("Delete tags:", tags);
  },

  clearAllNotifications(): void {
    console.log("Clear all notifications");
  },

  handleNotification(message: PushMessage): void {
    console.log("Received notification:", message);

    if (message.extras?.type === "position") {
      const positionId = message.extras.positionId;
      if (positionId) {
        Taro.navigateTo({
          url: `/pages/positions/detail?id=${positionId}`,
        });
      }
    } else if (message.extras?.type === "announcement") {
      const announcementId = message.extras.announcementId;
      if (announcementId) {
        Taro.navigateTo({
          url: `/subpackages/announcements/detail?id=${announcementId}`,
        });
      }
    }
  },

  registerNotificationListener(callback: (message: PushMessage) => void): () => void {
    const handleMessage = (event: any) => {
      const message: PushMessage = {
        title: event.title || "",
        content: event.content || event.alert || "",
        extras: event.extras || {},
      };
      callback(message);
    };

    // Register listener (implementation depends on push SDK)
    console.log("Notification listener registered", handleMessage);

    return () => {
      console.log("Notification listener removed");
    };
  },
};

export function usePush(userId?: number) {
  const initPush = async () => {
    await pushService.init({
      appKey: "your-jpush-app-key",
      channel: "default",
    });

    if (userId) {
      await pushService.uploadPushToken(userId);
      pushService.setAlias(`user_${userId}`);
    }
  };

  const cleanupPush = () => {
    pushService.deleteAlias();
  };

  return {
    initPush,
    cleanupPush,
    isPushEnabled: pushService.isPushEnabled,
    setPushEnabled: pushService.setPushEnabled,
  };
}
