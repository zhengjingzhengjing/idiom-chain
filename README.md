# 成语接龙

一个基于 Vue 3、TypeScript、Pinia 和 Vite 构建的单机成语接龙练习应用。玩家输入成语后，系统会校验接龙规则并由 AI 自动回应，同时展示拼音、释义、例句、提示候选和本局学习总结。

## 在线体验

- Cloudflare Workers: <https://idiom-chain.1058285396.workers.dev/>

## 功能特性

- 严格同字接龙：下一个成语必须以前一个成语的末字开头。
- 本地成语词库：内置成语、拼音、释义、例句和难度信息，无需后端服务。
- AI 自动接龙：支持轻松、普通、挑战三档难度。
- 提示候选：根据当前接龙字给出可用成语建议。
- 生词收藏：可收藏当前成语，数据保存在浏览器本地。
- 学习总结：记录本局出现过的成语，便于复盘。
- 单机运行：核心逻辑在前端完成，适合静态部署。

## 技术栈

- Vue 3
- TypeScript
- Pinia
- Vite
- Cloudflare Workers 静态部署

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

启动后根据终端提示访问本地开发地址，通常为 `http://localhost:5173/`。

### 类型检查与生产构建

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

### 本地预览构建产物

```bash
npm run preview
```

## 项目结构

```text
.
├── docs/                    # 项目说明与开发文档
├── src/
│   ├── components/          # Vue 组件
│   │   └── chain/           # 接龙历史、成语详情、学习总结等组件
│   ├── data/                # 本地成语数据
│   ├── services/            # 成语查询、校验和 AI 出词逻辑
│   ├── stores/              # Pinia 状态管理
│   ├── styles/              # 全局样式
│   ├── types/               # TypeScript 类型定义
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 核心逻辑

- `src/services/idiomEngine.ts` 负责成语标准化、查询、接龙合法性判断、提示候选和 AI 出词策略。
- `src/stores/gameStore.ts` 负责游戏状态、历史记录、胜负判断、难度切换和收藏持久化。
- `src/data/idioms.ts` 维护本地成语词库，并派生首字、末字等接龙元信息。

## 部署

项目已部署到 Cloudflare Workers：

<https://idiom-chain.1058285396.workers.dev/>

常规部署流程：

```bash
npm run build
```

然后将 `dist/` 目录作为静态站点产物发布到 Cloudflare Workers、Cloudflare Pages 或其他静态托管平台。

## 后续计划

- 扩充成语词库，覆盖更多接龙路径。
- 增加词典搜索与生词复习页面。
- 增加同音接龙模式，并处理多音字场景。
- 增加本地统计，例如提示次数、失败字、常错成语等。

## 文档

- [MVP 开发计划](docs/development-plan.md)
