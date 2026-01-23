"""OCR识别解析器"""

import os
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from loguru import logger

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import cv2
except ImportError:
    cv2 = None


class OCRParser:
    """OCR识别解析器

    功能：
    - PaddleOCR集成
    - Tesseract备用
    - 图片预处理
    - 表格区域识别
    - 文字坐标提取
    """

    def __init__(self, engine: str = "paddleocr", use_gpu: bool = False):
        """
        Args:
            engine: OCR引擎 ('paddleocr' 或 'tesseract')
            use_gpu: 是否使用GPU
        """
        self.engine = engine
        self.use_gpu = use_gpu
        self.ocr = None

        self._init_engine()

    def _init_engine(self):
        """初始化OCR引擎"""
        if self.engine == "paddleocr":
            try:
                from paddleocr import PaddleOCR

                self.ocr = PaddleOCR(
                    use_angle_cls=True,
                    lang="ch",
                    use_gpu=self.use_gpu,
                    show_log=False,
                )
                logger.info("PaddleOCR引擎初始化成功")
            except ImportError:
                logger.warning("PaddleOCR未安装，尝试使用Tesseract")
                self.engine = "tesseract"

        if self.engine == "tesseract":
            try:
                import pytesseract

                pytesseract.get_tesseract_version()
                logger.info("Tesseract引擎初始化成功")
            except Exception as e:
                logger.error(f"Tesseract初始化失败: {e}")
                raise ImportError("OCR引擎初始化失败")

    def parse_image(self, image_path: str) -> Dict[str, Any]:
        """识别图片中的文字

        Args:
            image_path: 图片路径

        Returns:
            识别结果，包含文本和坐标
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"图片不存在: {image_path}")

        # 预处理图片
        processed_image = self._preprocess_image(image_path)

        if self.engine == "paddleocr":
            return self._parse_with_paddle(processed_image)
        else:
            return self._parse_with_tesseract(processed_image)

    def _preprocess_image(self, image_path: str) -> np.ndarray:
        """预处理图片"""
        if cv2 is None:
            # 使用PIL读取
            img = Image.open(image_path)
            return np.array(img)

        # 读取图片
        img = cv2.imread(image_path)

        if img is None:
            raise ValueError(f"无法读取图片: {image_path}")

        # 灰度化
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 去噪
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # 二值化
        _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 转回BGR（PaddleOCR需要）
        result = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)

        return result

    def _parse_with_paddle(self, image: np.ndarray) -> Dict[str, Any]:
        """使用PaddleOCR识别"""
        result = self.ocr.ocr(image, cls=True)

        if not result or not result[0]:
            return {"text": "", "lines": [], "tables": []}

        lines = []
        all_text = []

        for line in result[0]:
            box = line[0]  # 坐标框
            text = line[1][0]  # 识别文字
            confidence = line[1][1]  # 置信度

            lines.append(
                {
                    "text": text,
                    "confidence": confidence,
                    "box": box,
                    "center_y": (box[0][1] + box[2][1]) / 2,
                    "center_x": (box[0][0] + box[2][0]) / 2,
                }
            )

            all_text.append(text)

        # 尝试识别表格结构
        tables = self._detect_tables(lines)

        return {
            "text": "\n".join(all_text),
            "lines": lines,
            "tables": tables,
        }

    def _parse_with_tesseract(self, image: np.ndarray) -> Dict[str, Any]:
        """使用Tesseract识别"""
        import pytesseract

        # 识别文字
        text = pytesseract.image_to_string(image, lang="chi_sim+eng")

        # 获取详细信息
        data = pytesseract.image_to_data(
            image, lang="chi_sim+eng", output_type=pytesseract.Output.DICT
        )

        lines = []
        for i, word in enumerate(data["text"]):
            if word.strip():
                lines.append(
                    {
                        "text": word,
                        "confidence": data["conf"][i],
                        "box": [
                            [data["left"][i], data["top"][i]],
                            [data["left"][i] + data["width"][i], data["top"][i]],
                            [
                                data["left"][i] + data["width"][i],
                                data["top"][i] + data["height"][i],
                            ],
                            [data["left"][i], data["top"][i] + data["height"][i]],
                        ],
                        "center_y": data["top"][i] + data["height"][i] / 2,
                        "center_x": data["left"][i] + data["width"][i] / 2,
                    }
                )

        return {
            "text": text,
            "lines": lines,
            "tables": [],
        }

    def _detect_tables(self, lines: List[Dict]) -> List[List[List[str]]]:
        """检测并提取表格结构"""
        if not lines:
            return []

        # 按Y坐标排序并分组
        lines_sorted = sorted(lines, key=lambda x: x["center_y"])

        # 将相近Y坐标的文本分为一行
        rows = []
        current_row = []
        current_y = lines_sorted[0]["center_y"]
        threshold = 20  # Y坐标差异阈值

        for line in lines_sorted:
            if abs(line["center_y"] - current_y) > threshold:
                if current_row:
                    # 按X坐标排序
                    current_row.sort(key=lambda x: x["center_x"])
                    rows.append([item["text"] for item in current_row])
                current_row = [line]
                current_y = line["center_y"]
            else:
                current_row.append(line)

        if current_row:
            current_row.sort(key=lambda x: x["center_x"])
            rows.append([item["text"] for item in current_row])

        if len(rows) < 2:
            return []

        # 检查是否为表格结构
        col_counts = [len(row) for row in rows]
        if len(set(col_counts)) > 3:  # 列数差异太大，可能不是表格
            return []

        return [rows]

    def extract_table_from_image(
        self, image_path: str, table_region: Optional[Tuple[int, int, int, int]] = None
    ) -> List[List[str]]:
        """从图片中提取表格

        Args:
            image_path: 图片路径
            table_region: 表格区域 (x1, y1, x2, y2)

        Returns:
            表格数据
        """
        if table_region and cv2 is not None:
            img = cv2.imread(image_path)
            x1, y1, x2, y2 = table_region
            cropped = img[y1:y2, x1:x2]
        else:
            cropped = self._preprocess_image(image_path)

        result = self.parse_image(image_path)

        if result["tables"]:
            return result["tables"][0]

        return []
