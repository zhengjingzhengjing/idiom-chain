import { idioms } from '../data/idioms'
import { AiLevel, IdiomDifficulty } from '../enums/idiom'
import type { IdiomWithMeta } from '../types/idiom'

const fallbackIdioms: IdiomWithMeta[] = [
  createFallbackIdiom('照本宣科', 'zhao ben xuan ke', '照着本子念条文，比喻不能灵活发挥。'),
  createFallbackIdiom('照猫画虎', 'zhao mao hua hu', '比喻照着样子模仿。'),
  createFallbackIdiom('科班出身', 'ke ban chu shen', '比喻受过正规的专业训练。'),
  createFallbackIdiom('虎口余生', 'hu kou yu sheng', '比喻经历极大危险后侥幸活下来。'),
  createFallbackIdiom('生龙活虎', 'sheng long huo hu', '形容活泼矫健，富有生气。'),
  createFallbackIdiom('身经百战', 'shen jing bai zhan', '形容经历过许多战斗或考验。'),
  createFallbackIdiom('战无不胜', 'zhan wu bu sheng', '形容力量强大，每战都能取胜。'),
  createFallbackIdiom('胜任愉快', 'sheng ren yu kuai', '指有能力承担任务，并能顺利完成。'),
  createFallbackIdiom('快马加鞭', 'kuai ma jia bian', '比喻加快速度。'),
  createFallbackIdiom('鞭长莫及', 'bian chang mo ji', '比喻力量达不到。'),
  createFallbackIdiom('及锋而试', 'ji feng er shi', '趁着士气旺盛时行动。'),
  createFallbackIdiom('事在人为', 'shi zai ren wei', '事情能否成功取决于人的努力。'),
  createFallbackIdiom('为人师表', 'wei ren shi biao', '在人品学问方面成为别人学习的榜样。'),
  createFallbackIdiom('表里如一', 'biao li ru yi', '外表和内心一致。'),
  createFallbackIdiom('一心一意', 'yi xin yi yi', '心思、意念专一，没有别的考虑。'),
  createFallbackIdiom('意气风发', 'yi qi feng fa', '形容精神振奋，气概豪迈。'),
]

const idiomMap = new Map<string, IdiomWithMeta>()
const firstCharIndex = new Map<string, IdiomWithMeta[]>()

;[...idioms, ...fallbackIdioms].forEach((idiom) => {
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
    difficulty: IdiomDifficulty.Medium,
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

  if (level === AiLevel.Easy) {
    return pickRandom(candidates)
  }

  const sortedByPressure = [...candidates].sort((a, b) => getNextCount(a, usedWords) - getNextCount(b, usedWords))

  if (level === AiLevel.Hard) {
    return sortedByPressure[0]
  }

  const playable = sortedByPressure
    .filter((idiom) => getNextCount(idiom, usedWords) > 0)
    .sort((a, b) => {
      const nextCountGap = getNextCount(b, usedWords) - getNextCount(a, usedWords)
      return nextCountGap || difficultyWeight(a) - difficultyWeight(b)
    })

  const learningFriendly = playable.filter((idiom) => idiom.difficulty !== IdiomDifficulty.Hard)
  return learningFriendly[0] ?? playable[0] ?? sortedByPressure.at(-1) ?? null
}

export function getHintOptions(previous: IdiomWithMeta, usedWords: Set<string>, size = 3): IdiomWithMeta[] {
  return getAvailableNextIdioms(previous, usedWords)
    .sort((a, b) => difficultyWeight(a) - difficultyWeight(b))
    .slice(0, size)
}

export function getRandomOpeningIdiom(): IdiomWithMeta {
  const easyOpenings = idioms.filter((idiom) => idiom.difficulty === IdiomDifficulty.Easy)
  return pickRandom(easyOpenings)
}

export function getTotalIdiomCount(): number {
  return idiomMap.size
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function difficultyWeight(idiom: IdiomWithMeta): number {
  const weights = {
    [IdiomDifficulty.Easy]: 1,
    [IdiomDifficulty.Medium]: 2,
    [IdiomDifficulty.Hard]: 3,
  } satisfies Record<IdiomWithMeta['difficulty'], number>

  return weights[idiom.difficulty]
}

function getNextCount(idiom: IdiomWithMeta, usedWords: Set<string>): number {
  return getAvailableNextIdioms(idiom, usedWords).length
}

function isPlausibleIdiom(word: string): boolean {
  return /^[\u4e00-\u9fff]{4,8}$/.test(word)
}

function createFallbackIdiom(word: string, pinyin: string, definition: string): IdiomWithMeta {
  return {
    word,
    pinyin,
    definition,
    difficulty: IdiomDifficulty.Easy,
    firstChar: word.at(0) ?? '',
    lastChar: word.at(-1) ?? '',
  }
}
