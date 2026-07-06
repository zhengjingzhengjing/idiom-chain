import { idioms } from '../data/idioms'
import type { AiLevel, IdiomWithMeta } from '../types/idiom'

const idiomMap = new Map<string, IdiomWithMeta>()
const firstCharIndex = new Map<string, IdiomWithMeta[]>()

idioms.forEach((idiom) => {
  idiomMap.set(idiom.word, idiom)

  const group = firstCharIndex.get(idiom.firstChar) ?? []
  group.push(idiom)
  firstCharIndex.set(idiom.firstChar, group)
})

export function normalizeIdiomInput(word: string): string {
  return word.trim().replace(/\s+/g, '')
}

export function findIdiom(word: string): IdiomWithMeta | undefined {
  return idiomMap.get(normalizeIdiomInput(word))
}

export function createCustomIdiom(word: string): IdiomWithMeta | null {
  const normalized = normalizeIdiomInput(word)

  if (!isPlausibleIdiom(normalized)) {
    return null
  }

  return {
    word: normalized,
    pinyin: '词库外输入',
    definition: '这是你输入的词库外成语，系统会按首尾字继续接龙。',
    difficulty: 'medium',
    firstChar: normalized.at(0) ?? '',
    lastChar: normalized.at(-1) ?? '',
  }
}

export function canChain(previous: IdiomWithMeta, next: IdiomWithMeta): boolean {
  return previous.lastChar === next.firstChar
}

export function getChainHint(previous?: IdiomWithMeta): string {
  return previous ? `请接「${previous.lastChar}」字开头的成语` : '输入任意成语开始接龙'
}

export function getAvailableNextIdioms(previous: IdiomWithMeta, usedWords: Set<string>): IdiomWithMeta[] {
  return (firstCharIndex.get(previous.lastChar) ?? []).filter((idiom) => !usedWords.has(idiom.word))
}

export function pickAiIdiom(previous: IdiomWithMeta, usedWords: Set<string>, level: AiLevel): IdiomWithMeta | null {
  const candidates = getAvailableNextIdioms(previous, usedWords)

  if (candidates.length === 0) {
    return null
  }

  if (level === 'easy') {
    return pickRandom(candidates)
  }

  const sortedByPressure = [...candidates].sort((a, b) => {
    const aNextCount = getAvailableNextIdioms(a, usedWords).length
    const bNextCount = getAvailableNextIdioms(b, usedWords).length
    return aNextCount - bNextCount
  })

  if (level === 'hard') {
    return sortedByPressure[0]
  }

  const learningFriendly = sortedByPressure.filter((idiom) => idiom.difficulty !== 'hard')
  return learningFriendly[0] ?? sortedByPressure[0]
}

export function getHintOptions(previous: IdiomWithMeta, usedWords: Set<string>, size = 3): IdiomWithMeta[] {
  return getAvailableNextIdioms(previous, usedWords)
    .sort((a, b) => difficultyWeight(a) - difficultyWeight(b))
    .slice(0, size)
}

export function getRandomOpeningIdiom(): IdiomWithMeta {
  const easyOpenings = idioms.filter((idiom) => idiom.difficulty === 'easy')
  return pickRandom(easyOpenings)
}

export function getTotalIdiomCount(): number {
  return idioms.length
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function difficultyWeight(idiom: IdiomWithMeta): number {
  const weights = {
    easy: 1,
    medium: 2,
    hard: 3,
  } satisfies Record<IdiomWithMeta['difficulty'], number>

  return weights[idiom.difficulty]
}

function isPlausibleIdiom(word: string): boolean {
  return /^[\u4e00-\u9fff]{4,8}$/.test(word)
}
