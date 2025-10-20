# EasyTrans - Chrome OCR翻译扩展

一个支持截图OCR和中英文翻译的Chrome浏览器扩展。

## 功能特性

- 🖼️ 区域截图：Shift + 拖拽选择屏幕区域
- 🔍 OCR识别：离线识别中英文文本
- 🌐 AI翻译：使用Kimi API进行智能翻译
- 📝 历史记录：保存最近10条翻译记录
- 🎨 简洁界面：轻量级、无广告

## 技术栈

- TypeScript
- Vite
- SCSS
- Tesseract.js (OCR)
- Chrome Extension API

## 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 安装依赖

```bash
pnpm install
```

## 开发命令

```bash
# 开发模式（热重载）
pnpm dev

# 生产构建
pnpm build

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

## 安装扩展

1. 运行 `pnpm build` 构建扩展
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

## 使用方法

1. 在网页上按住 Shift 键
2. 拖拽鼠标选择要翻译的区域
3. 松开鼠标自动进行OCR和翻译
4. 查看悬浮窗口中的翻译结果

## License

MIT