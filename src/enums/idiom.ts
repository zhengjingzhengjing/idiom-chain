export enum AiLevel {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
}

export enum GameStatus {
  Idle = 'idle',
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export enum Player {
  Human = 'human',
  Ai = 'ai',
}

export enum IdiomDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export const AI_LEVEL_LABELS: Record<AiLevel, string> = {
  [AiLevel.Easy]: '轻松',
  [AiLevel.Normal]: '普通',
  [AiLevel.Hard]: '挑战',
}

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  [GameStatus.Idle]: '待开始',
  [GameStatus.Playing]: '进行中',
  [GameStatus.Won]: '你赢了',
  [GameStatus.Lost]: '本局结束',
}

export const DIFFICULTY_LABELS: Record<IdiomDifficulty, string> = {
  [IdiomDifficulty.Easy]: '常见',
  [IdiomDifficulty.Medium]: '进阶',
  [IdiomDifficulty.Hard]: '生僻',
}
