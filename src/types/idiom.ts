import type { AiLevel, GameStatus, IdiomDifficulty, Player } from '../enums/idiom'

export interface IdiomItem {
  word: string
  pinyin: string
  definition: string
  example?: string
  difficulty: IdiomDifficulty
}

export interface IdiomWithMeta extends IdiomItem {
  firstChar: string
  lastChar: string
}

export interface ChainEntry {
  id: string
  idiom: IdiomWithMeta
  player: Player
}

export type { AiLevel, GameStatus, Player }
