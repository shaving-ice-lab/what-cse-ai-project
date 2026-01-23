"""文档解析器模块"""

from .html_parser import HTMLParser
from .pdf_parser import PDFParser
from .excel_parser import ExcelParser
from .word_parser import WordParser
from .ocr_parser import OCRParser

__all__ = [
    "HTMLParser",
    "PDFParser",
    "ExcelParser",
    "WordParser",
    "OCRParser",
]
