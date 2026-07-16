# DeepSeek 接入说明

本项目在本地开发时通过 Vite 中间件代理 DeepSeek 请求，前端只会请求本地接口：

```text
POST /api/deepseek/idiom
```

## 配置方式

复制 `.env.example` 为 `.env.local`，然后填入你的 Key：

```env
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
```

重启开发服务：

```bash
npm run dev
```

## 行为说明

- 玩家提交成语后，前端会先请求 `/api/deepseek/idiom`。
- Vite 中间件读取 `.env.local` 里的 `DEEPSEEK_API_KEY`，再请求 DeepSeek。
- DeepSeek 返回的成语会在服务端校验：必须以前一个成语尾字开头，且不能重复。
- 如果 DeepSeek 请求失败、返回格式不对或接龙不合法，接口会用 `200` 返回 `error` 字段，前端自动回落到本地词库，避免页面出现 502。
- 官方当前文档列出的聊天模型是 `deepseek-v4-flash` 和 `deepseek-v4-pro`。如果你仍想试旧的 `deepseek-chat`，可以把 `DEEPSEEK_MODEL` 改回去，但建议优先使用 `deepseek-v4-flash`。
