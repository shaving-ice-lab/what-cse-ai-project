import { View, Text, Canvas, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { shareUtils, PositionShareData } from "../../utils";
import "./index.scss";

interface ShareModalProps {
  visible: boolean;
  position: PositionShareData;
  onClose: () => void;
}

export function ShareModal({ visible, position, onClose }: ShareModalProps) {
  const [posterPath, setPosterPath] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const handleGeneratePoster = async () => {
    setGenerating(true);
    try {
      const path = await shareUtils.generateSharePoster(position);
      setPosterPath(path);
    } catch (error) {
      Taro.showToast({ title: "生成海报失败", icon: "none" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePoster = async () => {
    if (posterPath) {
      await shareUtils.saveToAlbum(posterPath);
    } else {
      await handleGeneratePoster();
      if (posterPath) {
        await shareUtils.saveToAlbum(posterPath);
      }
    }
  };

  const handleCopyLink = () => {
    shareUtils.copyLink(`/pages/positions/detail?id=${position.id}`);
    onClose();
  };

  if (!visible) return null;

  return (
    <View className="share-modal-mask" onClick={onClose}>
      <View className="share-modal" onClick={(e) => e.stopPropagation()}>
        <View className="share-modal-header">
          <Text className="share-modal-title">分享职位</Text>
          <Text className="share-modal-close" onClick={onClose}>
            ×
          </Text>
        </View>

        <View className="share-modal-content">
          <View className="share-options">
            <Button className="share-option" openType="share">
              <View className="share-icon wechat-icon" />
              <Text className="share-label">微信好友</Text>
            </Button>

            <View className="share-option" onClick={handleCopyLink}>
              <View className="share-icon link-icon" />
              <Text className="share-label">复制链接</Text>
            </View>

            <View className="share-option" onClick={handleSavePoster}>
              <View className="share-icon poster-icon" />
              <Text className="share-label">{generating ? "生成中..." : "生成海报"}</Text>
            </View>
          </View>
        </View>

        <Canvas
          canvasId="shareCanvas"
          style={{ width: "375px", height: "600px", position: "fixed", left: "-9999px" }}
        />
      </View>
    </View>
  );
}

export default ShareModal;
