import { DEFAULT_DEEPSEEK_MODEL } from '../enums/ai'
import type { AiIdiomRequest, AiIdiomResponse, AiIdiomResult } from '../types/ai'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekChoice {
  finish_reason?: string
  message?: {
    content?: string | null
    reasoning_content?: string | null
  }
}

interface DeepSeekResponse {
  choices?: DeepSeekChoice[]
  error?: {
    message?: string
  }
}

interface DeepSeekClientOptions {
  apiKey: string
  model?: string
}

export async function requestDeepSeekIdiom(
  payload: AiIdiomRequest,
  options: DeepSeekClientOptions,
): Promise<AiIdiomResponse> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_DEEPSEEK_MODEL,
      messages: buildMessages(payload),
      thinking: { type: 'disabled' },
      response_format: { type: 'json_object' },
      temperature: getTemperature(payload.level),
      max_tokens: 512,
    }),
  })

  const data = (await response.json().catch(() => ({}))) as DeepSeekResponse

  if (!response.ok) {
    return { error: data.error?.message || `DeepSeek 请求失败：${response.status}` }
  }

  const choice = data.choices?.[0]
  const content = choice?.message?.content
  if (!content) {
    return { error: `DeepSeek 没有返回可用内容${choice?.finish_reason ? `，停止原因：${choice.finish_reason}` : ''}。` }
  }

  const idiom = parseIdiomContent(content)
  if (!idiom) {
    return { error: 'DeepSeek 返回格式无法解析。' }
  }

  if (!isValidAiIdiom(payload, idiom)) {
    return { error: 'DeepSeek 返回的成语不符合接龙规则。' }
  }

  return { idiom }
}

function buildMessages(payload: AiIdiomRequest): DeepSeekMessage[] {
  const usedWords = payload.usedWords.length > 0 ? payload.usedWords.join('、') : '无'
  const targetChar = payload.previousWord.at(-1) || ''

  return [
    {
      role: 'system',
      content:
        '你是一个中文成语接龙助手。必须只返回 JSON 对象，不要解释。返回的成语必须是真实常见成语，必须以前一个成语的最后一个汉字开头，不能出现在已用成语中。',
    },
    {
      role: 'user',
      content: [
        `前一个成语：${payload.previousWord}`,
        `必须以这个汉字开头：${targetChar}`,
        `已用成语：${usedWords}`,
        `难度：${payload.level}`,
        '请返回：{"word":"成语","pinyin":"拼音","definition":"释义","example":"例句"}',
      ].join('\n'),
    },
  ]
}

function parseIdiomContent(content: string): AiIdiomResult | null {
  try {
    const parsed = JSON.parse(extractJson(content)) as Partial<AiIdiomResult>
    if (!parsed.word || !/^[\u4e00-\u9fff]{4,8}$/.test(parsed.word)) {
      return null
    }

    return {
      word: parsed.word,
      pinyin: parsed.pinyin || 'DeepSeek 生成',
      definition: parsed.definition || 'DeepSeek 返回的接龙成语。',
      example: parsed.example,
    }
  } catch {
    return null
  }
}

function isValidAiIdiom(payload: AiIdiomRequest, idiom: AiIdiomResult): boolean {
  const targetChar = payload.previousWord.at(-1)
  return Boolean(targetChar && idiom.word.startsWith(targetChar) && !payload.usedWords.includes(idiom.word))
}

function extractJson(content: string): string {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  return start >= 0 && end > start ? content.slice(start, end + 1) : content
}

function getTemperature(level: AiIdiomRequest['level']): number {
  return level === 'hard' ? 0.8 : 0.4
}
