# 📁 在线文档编辑器
## 2026-01-19

一个纯前端的在线文档查看与编辑器，支持多种常见文档格式。无需后端服务器，所有文件处理均在浏览器中完成。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)

## ✨ 功能特性

### 支持的文件格式

| 格式 | 导入 | 查看 | 编辑 | 导出 |
|:----:|:----:|:----:|:----:|:----:|
| Excel (.xlsx, .xls, .csv) | ✅ | ✅ | ✅ | ✅ XLSX/CSV |
| Word (.docx) | ✅ | ✅ | ✅ | ✅ DOCX/HTML |
| Markdown (.md) | ✅ | ✅ | ✅ | ✅ MD/HTML |
| PDF (.pdf) | ✅ | ✅ | ❌ | ❌ |
| PPT (.pptx) | ✅ | ✅ | ❌ | ❌ |

### 编辑器功能

#### 📊 Excel 编辑器
- 多工作表支持
- 单元格编辑
- 添加行/列
- 支持公式显示
- 导出为 XLSX 或 CSV

#### 📝 Word 编辑器
- 富文本编辑
- 格式工具栏（粗体、斜体、下划线等）
- 标题样式
- 列表（有序/无序）
- 插入链接和图片
- 文字颜色和背景色
- 导出为 DOCX 或 HTML

#### 📑 Markdown 编辑器
- 实时预览
- 分屏/纯编辑/纯预览模式
- 语法快捷按钮
- GFM 语法支持
- 表格支持
- 代码高亮
- 导出为 MD 或 HTML

#### 📄 PDF 查看器
- 多页浏览
- 缩放功能
- 页面跳转
- 高清渲染

#### 📽️ PPT 查看器
- 幻灯片浏览
- 缩略图导航
- 键盘快捷键
- 全屏模式

### 通用功能

- 🔄 撤销/重做
- 💾 保存状态
- 📂 拖拽导入文件
- 🎨 现代化 UI 设计
- 📱 响应式布局


## 增加epub 模式 2026-01-19

### 支持的文件格式

| 格式 | 导入 | 查看 | 编辑 | 导出 |
|:----:|:----:|:----:|:----:|:----:|
| Excel (.xlsx, .xls, .csv) | ✅ | ✅ | ✅ | ✅ XLSX/CSV |
| Word (.docx) | ✅ | ✅ | ✅ | ✅ DOCX/HTML |
| Markdown (.md) | ✅ | ✅ | ✅ | ✅ MD/HTML |
| PDF (.pdf) | ✅ | ✅ | ❌ | ❌ |
| PPT (.pptx) | ✅ | ✅ | ❌ | ❌ |
| **EPUB (.epub)** | ✅ | ✅ | ❌ | ❌ |

#### 📚 EPUB 查看器
- 章节目录导航
- 封面显示
- 字号调节
- 键盘翻页
- 图片显示

## PPT的读取功能还未解决，还会报错。 2029-01-19