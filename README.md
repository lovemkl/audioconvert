# AudioConvert

本地音频格式转换工具 — 离线优先，即开即用，跨平台。

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/) stable
- [Tauri CLI v2](https://tauri.app/start/): `npm install -g @tauri-apps/cli`

### 第一步：下载 FFmpeg（必须）

**macOS / Linux：**
```bash
bash scripts/download-ffmpeg.sh
```

**Windows（PowerShell）：**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts\download-ffmpeg.ps1
```

### 第二步：安装依赖并启动开发模式

```bash
npm install
npm run tauri:dev
```

### 构建发布包

```bash
npm run tauri:build
```

输出文件在 `src-tauri/target/release/bundle/`。

## 项目结构

```
audioconvert/
├── src/                        # React 前端
│   ├── components/
│   │   ├── wizard/             # 三步向导页面
│   │   │   ├── WizardShell.tsx
│   │   │   ├── Step1Import.tsx
│   │   │   ├── Step2Settings.tsx
│   │   │   ├── Step3Convert.tsx
│   │   │   └── ResultPage.tsx
│   │   └── ui/                 # 通用弹窗
│   │       ├── FirstRunDialog.tsx
│   │       ├── SettingsPanel.tsx
│   │       └── PluginCenter.tsx
│   ├── i18n/                   # 中英文翻译
│   ├── lib/                    # ipc.ts, formats.ts
│   └── types/                  # TypeScript 类型
├── src-tauri/                  # Rust 后端
│   ├── src/
│   │   ├── commands/           # Tauri 命令 (file, convert, settings, plugin)
│   │   ├── ffmpeg.rs           # FFmpeg Sidecar 封装
│   │   ├── models.rs           # 数据结构
│   │   ├── settings.rs         # 持久化配置
│   │   └── lib.rs              # 入口
│   ├── bin/                    # FFmpeg 二进制（运行脚本后生成）
│   └── tauri.conf.json
├── scripts/
│   ├── download-ffmpeg.sh      # macOS/Linux FFmpeg 下载
│   └── download-ffmpeg.ps1     # Windows FFmpeg 下载
└── .github/workflows/build.yml # CI/CD
```

## 格式支持

| 类型 | 格式 |
|------|------|
| Tier 1（主程序，离线） | MP3, FLAC, WAV, AAC, OGG, Opus, ALAC, AIFF, WMA, APE, DSD/DSF |
| Tier 2（主程序，离线） | ATRAC3, WavPack, TTA, Speex, AMR, AC3, DTS, MP2, CAF |
| Tier 3（可选插件） | QQ音乐(.mgg/.mflac/.qmc*), 网易云(.ncm), 酷狗(.kgg) |
| 不支持 | DRM 加密内容（Apple Music DRM, WMA DRM）|

## 许可证

MIT
