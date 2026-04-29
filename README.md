# Our Eternal Seasons

> Vibe Coding 习作 #01 · 一个双时区情侣时间线 demo · 静态展示挂在 [buyunfadian.com/lab/playground/eternal-seasons/](https://buyunfadian.com/lab/playground/eternal-seasons/)

这是一份「概念 demo」，不是要发布的产品。它是我自己在 [Google AI Studio](https://aistudio.google.com) 里搭起来、再用本地 IDE 补完的一个小工程，主要用途是展示一段完整的 Vibe Coding 工作流。

## 起源

B 站短视频底下有一条评论：作者和女朋友异地，自己画了一张 demo 图挂出来，希望能有这样一个双时区时间线 app。我把那张图当锚点，决定围绕它做一个静态 UI 习作。

最近又刷到不少关于慕夏（Alphonse Mucha）的内容，就去博物馆网站挑了几幅代表作，把 Art Nouveau 的装饰边、藤蔓线、肖像奖章和金调当作风格参考。

## 设计与实现路径

| 阶段 | 工具 | 产出 |
|---|---|---|
| 1. 视觉打底 | [Stitch](https://stitch.withgoogle.com) | 基于 B 站那张 demo 图扩出页面骨架（Timeline / Calendar / Letters / Us），再以慕夏几幅代表作为风格输入做模仿 |
| 2. 架构搭主干 | Google AI Studio（Gemini 3.1 Pro） | React + Vite + TypeScript + Tailwind v4 工程，Firebase Auth + Firestore 后端链路、登录流程、路由 |
| 3. 后端 / 架构 / 代码审查 / 网页对接 | Codex + Claude Code（本地） | 补完后端逻辑、整理整体架构、做代码审查；把构建产物嵌入个人网站 |
| 4. 同步回 AI Studio | Google AI Studio | 保持云端 IDE 与本地工程一致 |

为什么后两步要落到本地：AI Studio 在生成完整后端代码时精度撑不住，所以工程导出本地后用 Codex / Claude Code 接管补强。整个流程的最终产物，被部署成 `buyunfadian.com` Lab 子目录下的静态展示。

## 这份代码做什么

- **Timeline**：双时区并行时间轴（北京 / 伦敦），藤蔓状中线 + 肖像奖章 + 共享视频通话块。
- **Calendar**：横向日期条 + 原生日期选择器跳转 + 当日日程列表 + 临时新增日程（仅存内存）。
- **Letters**：选语气（日常 / 想念 / 计划）→ 写一句话 → 生成带日期的小卡片。
- **Us**：双人头像、时区、空间邀请码（一键复制到剪贴板）。

界面整体走 mobile-first，宽度限制在 ~28rem 内。所有数据走本地 demo（[`src/lib/demo.ts`](src/lib/demo.ts)）。

## 两种运行模式

通过 `VITE_SHOWCASE_MODE` 环境变量切换。

| 模式 | 切换方式 | 行为 |
|---|---|---|
| **Showcase（默认）** | 不设环境变量，或设为非 `false` | 跳过 Firebase Auth，自动登录为 `demo-me`，使用 [`src/lib/demo.ts`](src/lib/demo.ts) 里的本地数据，所有写入只活在浏览器内存里 |
| **Real**（保留给想 fork 真用的人） | `VITE_SHOWCASE_MODE=false` | 启用 Firebase Auth + Firestore，需要自备 Firebase 项目和凭证；恢复到 AI Studio 初版的完整后端链路 |

## 本地运行

需要 Node.js（版本随 `package.json` 推荐）。

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build    # 输出 dist/
```

**作为子目录静态展示构建** —— 用相对路径 base：

```bash
npm run build -- --base ./
```

构建产物（`dist/index.html` + `dist/assets/`）可以直接拷到任意子路径下，`HashRouter` 会处理所有路由。

## 技术决策

- **`HashRouter` 而非 `BrowserRouter`**：Vibe Coding 阶段把路由改成了 hash，这样无论挂在哪个子路径下都不会被宿主站点的 wildcard 路由踢出去。
- **资源相对路径**：`src/lib/demo.ts` 与 `src/pages/Timeline.tsx` 里所有 `./assets/*` 都是相对路径，配合 `--base ./` 在子目录部署时不会 404。
- **`scrollbar-width: none`**：内嵌 iframe 展示时不暴露内部滚动条，外观更接近真机屏幕。
- **Firebase 公网 config 入仓**：[`firebase-applet-config.json`](firebase-applet-config.json) 留在仓库里，因为 Firebase web config 本就可公开，安全由 Firestore 规则控制；fork 自用时建议自己换一份配置 + 改一遍 [`firestore.rules`](firestore.rules)。

## 仓库结构

```
src/
├── App.tsx              # HashRouter + 受保护路由
├── main.tsx             # 入口
├── index.css            # 全局样式 + Art Nouveau 自定义类
├── context/
│   ├── AuthContext.tsx  # showcase 模式短路 Firebase Auth
│   └── AppContext.tsx   # Space + Events 状态，showcase 走内存
├── pages/
│   ├── Timeline.tsx     # 主界面（4 个 tab + 设置面板 + 新增 modal）
│   ├── SignIn.tsx       # 仅 Real 模式使用
│   ├── Setup.tsx        # 仅 Real 模式使用
│   └── JoinSpace.tsx    # 仅 Real 模式使用
└── lib/
    ├── api.ts           # Firestore CRUD
    ├── firebase.ts      # Firebase 初始化
    └── demo.ts          # 本地 showcase 数据
```

## 致谢

- B 站那条评论的作者，给了原始需求和那张 demo 图。
- [Alphonse Mucha](https://en.wikipedia.org/wiki/Alphonse_Mucha) 的代表作，作为 Art Nouveau 风格参考；肖像图来自其作品的公共领域版本。
- [Google AI Studio](https://aistudio.google.com) / Gemini 3.1 Pro，搭出了完整工程的初始架构。
- [Stitch](https://stitch.withgoogle.com) 用来快速拼接 UI。
- Codex + Claude Code 在本地阶段补完后端、架构、审查与网页对接。

## 状态

- 这份仓库是 Vibe Coding 工作流的展示物。 **不打算上 App Store，也不打算开放真实双人空间。**
- 想看运行效果：[buyunfadian.com/lab/playground/eternal-seasons/](https://buyunfadian.com/lab/playground/eternal-seasons/)。
- 想了解 Vibe Coding 工作流如何在「不允法典」其它项目中落地：[buyunfadian.com/lab/](https://buyunfadian.com/lab/)。
