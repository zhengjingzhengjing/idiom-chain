import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { DEFAULT_DEEPSEEK_MODEL } from './src/enums/ai'
import { requestDeepSeekIdiom } from './src/services/deepseekClient'
import type { AiIdiomRequest } from './src/types/ai'

export default defineConfig({
  plugins: [vue(), deepSeekApiPlugin()],
})

function deepSeekApiPlugin(): Plugin {
  return {
    name: 'idiom-chain-deepseek-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')

      server.middlewares.use('/api/deepseek/idiom', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: '只支持 POST 请求。' })
          return
        }

        const apiKey = env.DEEPSEEK_API_KEY
        if (!apiKey) {
          sendJson(response, 200, { error: '还没有配置 DEEPSEEK_API_KEY。' })
          return
        }

        try {
          const payload = (await readJsonBody(request)) as AiIdiomRequest
          const result = await requestDeepSeekIdiom(payload, {
            apiKey,
            model: env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
          })

          sendJson(response, 200, result)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'DeepSeek 接口请求失败。'
          sendJson(response, 200, { error: message })
        }
      })
    },
  }
}

function readJsonBody(request: NodeJS.ReadableStream): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('请求体不是有效 JSON。'))
      }
    })
    request.on('error', reject)
  })
}

function sendJson(
  response: NodeJS.WritableStream & { statusCode?: number; setHeader?: (name: string, value: string) => void },
  status: number,
  data: unknown,
): void {
  response.statusCode = status
  response.setHeader?.('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(data))
}
