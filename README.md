# 水印大师 (Watermark Master)

一款简洁好用的图片水印工具，支持文字水印、图片水印和相机风格的边框信息模板。可在桌面端（Electron）和手机浏览器（Web）上使用。

## ✨ 功能特性

- 🖼️ **批量处理** — 一次导入多张图片，统一添加水印
- ✏️ **文字水印** — 自定义文字、字体、字号、颜色、透明度、旋转
- 🏷️ **图片水印** — 支持上传 Logo 等图片作为水印
- 📐 **九宫格定位** — 锚点 + 偏移定位，任意画布尺寸都能精准对齐
- 🎞️ **相机边框模板** — 内置 LEICA、SONY、FUJIFILM、Canon、Shot on iPhone 等风格，整体可拖拽、内容可编辑
- 🖐️ **拖拽调整** — 在画布上直接拖动水印，自动记忆位置
- 💾 **模板系统** — 保存常用配置为模板，一键复用
- 📱 **响应式布局** — 桌面端三栏布局，移动端单栏 + 底部 Tab
- 📤 **多格式导出** — 支持 JPG / PNG / WebP，可调质量

## 🖥️ 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| 桌面端 (Windows/macOS/Linux) | ✅ 已支持 | 基于 Electron |
| 手机浏览器 (Web) | ✅ 已支持 | 响应式布局，浏览器直接下载导出 |
| 微信小程序 | 🚧 规划中 | 小程序运行时不支持 Fabric.js，需用 Taro/uni-app 重构渲染层，作为独立后续工作 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

**Web 开发（手机浏览器调试）：**

```bash
npm run dev
```

启动后访问终端提示的地址（默认 `http://localhost:5173`）。手机与电脑在同一局域网时，可用 `npm run dev -- --host` 暴露地址，在手机浏览器中打开局域网 IP 访问。

**桌面端开发（Electron）：**

```bash
npm run electron:dev
```

### 构建打包

```bash
# 构建 Web 静态资源（输出到 dist/）
npm run build

# 打包桌面安装包（输出到 release/）
npm run electron:build
```

## 📖 使用说明

1. **添加图片** — 点击「添加图片」选择一张或多张图片
2. **添加水印** — 用「快速添加」按钮添加文字/日期/版权/图片水印，或从「模板库」选择边框模板
3. **调整位置** — 在画布上拖动水印，或用右侧九宫格选择器快速定位
4. **编辑属性** — 选中水印后在右侧面板调整文字、颜色、字号、透明度等
5. **导出** — 展开「导出」设置选择格式和质量，点击导出（Web 端会触发浏览器下载）

## 🛠️ 技术栈

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — 构建工具
- [Fabric.js](http://fabricjs.com/) — Canvas 画布渲染
- [Electron](https://www.electronjs.org/) — 桌面端封装

## 📂 项目结构

```
src/
├── components/          # React 组件
│   ├── ImageUploader.tsx    # 图片列表
│   ├── WatermarkEditor.tsx  # 画布编辑器
│   ├── WatermarkPanel.tsx   # 水印设计面板
│   └── ExportPanel.tsx      # 导出面板
├── lib/                 # 工具库
│   ├── position.ts          # 锚点定位计算
│   ├── templates.ts         # 模板数据与管理
│   ├── export-image.ts      # 图片合成与导出
│   └── electron-api.ts      # 平台 API 抽象（Web/Electron）
├── types/               # TypeScript 类型定义
└── App.tsx              # 应用入口（含响应式布局）
electron/                # Electron 主进程
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交改动 (`git commit -m 'feat: 添加某功能'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 提交 Pull Request

## 📄 开源协议

[MIT](LICENSE)
