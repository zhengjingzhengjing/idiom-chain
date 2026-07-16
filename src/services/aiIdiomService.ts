import { IdiomDifficulty } from '../enums/idiom'
import type { AiIdiomRequest, AiIdiomResponse, AiIdiomResult } from '../types/ai'
import type { IdiomWithMeta } from '../types/idiom'

export interface AiIdiomServiceResult {
  idiom: IdiomWithMeta | null
  error?: string
}

export async function requestAiIdiom(payload: AiIdiomRequest): Promise<AiIdiomServiceResult> {
  try {
    const response = await fetch('/api/deepseek/idiom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as AiIdiomResponse
    if (!response.ok || !data.idiom) {
      return { idiom: null, error: data.error || 'DeepSeek 暂时不可用。' }
    }

    return { idiom: toIdiomWithMeta(data.idiom) }
  } catch {
    return { idiom: null, error: 'DeepSeek 请求没有完成。' }
  }
}

function toIdiomWithMeta(idiom: AiIdiomResult): IdiomWithMeta {
  return {
    ...idiom,
    difficulty: IdiomDifficulty.Medium,
    firstChar: idiom.word.at(0) ?? '',
    lastChar: idiom.word.at(-1) ?? '',
  }
}
