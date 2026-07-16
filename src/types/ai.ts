import type { AiLevel } from '../enums/idiom'

export interface AiIdiomRequest {
  previousWord: string
  usedWords: string[]
  level: AiLevel
}

export interface AiIdiomResult {
  word: string
  pinyin: string
  definition: string
  example?: string
}

export interface AiIdiomResponse {
  idiom?: AiIdiomResult
  error?: string
}
