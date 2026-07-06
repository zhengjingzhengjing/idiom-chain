export interface IdiomItem {
  word: string
  pinyin: string
  definition: string
  example?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface IdiomWithMeta extends IdiomItem {
  firstChar: string
  lastChar: string
}

export type Player = 'human' | 'ai'

export interface ChainEntry {
  id: string
  idiom: IdiomWithMeta
  player: Player
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export type AiLevel = 'easy' | 'normal' | 'hard'
