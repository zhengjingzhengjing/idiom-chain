import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { requestAiIdiom } from '../services/aiIdiomService'
import { AiLevel, GameStatus, Player } from '../enums/idiom'
import {
  canChain,
  createCustomIdiom,
  findIdiom,
  getChainHint,
  getHintOptions,
  getRandomOpeningIdiom,
  getTotalIdiomCount,
  normalizeIdiomInput,
  pickAiIdiom,
} from '../services/idiomEngine'
import type { ChainEntry, IdiomWithMeta } from '../types/idiom'

const FAVORITES_KEY = 'idiom-chain:favorites'

export const useGameStore = defineStore('game', () => {
  const history = ref<ChainEntry[]>([])
  const usedWords = ref<Set<string>>(new Set())
  const favorites = ref<Set<string>>(loadFavorites())
  const status = ref<GameStatus>(GameStatus.Idle)
  const aiLevel = ref<AiLevel>(AiLevel.Normal)
  const message = ref('输入任意成语开始，AI 会自动接下一句。')
  const hintOptions = ref<IdiomWithMeta[]>([])
  const isAiThinking = ref(false)

  const lastEntry = computed(() => history.value.at(-1))
  const currentIdiom = computed(() => lastEntry.value?.idiom)
  const chainHint = computed(() => getChainHint(currentIdiom.value))
  const roundCount = computed(() => Math.ceil(history.value.length / 2))
  const totalIdiomCount = computed(() => getTotalIdiomCount())
  const learnedIdioms = computed(() => history.value.map((entry) => entry.idiom))

  async function submitHumanIdiom(input: string): Promise<void> {
    if (isAiThinking.value) {
      return
    }

    const word = normalizeIdiomInput(input)
    const idiom = findIdiom(word) ?? createCustomIdiom(word)

    hintOptions.value = []

    if (status.value === GameStatus.Won || status.value === GameStatus.Lost) {
      message.value = '本局已经结束，可以重开一局。'
      return
    }

    if (!idiom) {
      message.value = `「${word || '空输入'}」看起来不像常规成语，请输入 4 到 8 个汉字。`
      return
    }

    const validationError = validateHumanMove(idiom)
    if (validationError) {
      message.value = validationError
      return
    }

    addEntry(idiom, Player.Human)
    status.value = GameStatus.Playing
    message.value = `接收「${idiom.word}」，DeepSeek 正在接龙...`
    isAiThinking.value = true

    try {
      const { idiom: aiIdiom, source } = await getAiMove(idiom)
      if (!aiIdiom) {
        status.value = GameStatus.Won
        message.value = `接收「${idiom.word}」。你赢了，AI 暂时接不上。`
        return
      }

      addEntry(aiIdiom, Player.Ai)
      finishAiMove(word, idiom, aiIdiom, source)
    } finally {
      isAiThinking.value = false
    }
  }

  function startWithRandomIdiom(): void {
    resetGame()
    const opening = getRandomOpeningIdiom()
    addEntry(opening, Player.Ai)
    status.value = GameStatus.Playing
    message.value = `AI 先手出了「${opening.word}」，你来接。`
  }

  function showHints(): void {
    if (!currentIdiom.value) {
      message.value = '还没有起始成语，可以先输入一个，或者让 AI 先手。'
      return
    }

    const options = getHintOptions(currentIdiom.value, usedWords.value)
    hintOptions.value = options
    message.value = options.length > 0 ? '给你几个可接的成语，先看释义再决定。' : '当前小词库里没有可接的成语了。'
  }

  function toggleFavorite(word: string): void {
    if (favorites.value.has(word)) {
      favorites.value.delete(word)
    } else {
      favorites.value.add(word)
    }

    saveFavorites(favorites.value)
  }

  function setAiLevel(level: AiLevel): void {
    aiLevel.value = level
  }

  function resetGame(): void {
    history.value = []
    usedWords.value = new Set()
    hintOptions.value = []
    status.value = GameStatus.Idle
    isAiThinking.value = false
    message.value = '输入任意成语开始，AI 会自动接下一句。'
  }

  async function getAiMove(idiom: IdiomWithMeta): Promise<{ idiom: IdiomWithMeta | null; source: 'deepseek' | 'local' }> {
    const deepSeekResult = await requestAiIdiom({
      previousWord: idiom.word,
      usedWords: [...usedWords.value],
      level: aiLevel.value,
    })

    if (deepSeekResult.idiom && validateAiMove(idiom, deepSeekResult.idiom)) {
      return { idiom: deepSeekResult.idiom, source: 'deepseek' }
    }

    const localIdiom = pickAiIdiom(idiom, usedWords.value, aiLevel.value)
    return { idiom: localIdiom, source: 'local' }
  }

  function finishAiMove(word: string, idiom: IdiomWithMeta, aiIdiom: IdiomWithMeta, source: 'deepseek' | 'local'): void {
    const sourceText = source === 'deepseek' ? 'DeepSeek 接了' : 'DeepSeek 暂时没接上，本地词库接了'
    const nextOptions = getHintOptions(aiIdiom, usedWords.value)
    if (nextOptions.length === 0) {
      message.value = `${sourceText}「${aiIdiom.word}」。如果你能想到「${aiIdiom.lastChar}」开头的成语，也可以继续挑战。`
      return
    }

    message.value = findIdiom(word)
      ? `${sourceText}「${aiIdiom.word}」，现在轮到你。`
      : `接收词库外成语「${idiom.word}」。${sourceText}「${aiIdiom.word}」，现在轮到你。`
  }

  function validateHumanMove(idiom: IdiomWithMeta): string {
    if (usedWords.value.has(idiom.word)) {
      return `「${idiom.word}」已经用过了，接龙不能重复。`
    }

    if (currentIdiom.value && !canChain(currentIdiom.value, idiom)) {
      return `需要接「${currentIdiom.value.lastChar}」字开头的成语。`
    }

    return ''
  }

  function validateAiMove(previous: IdiomWithMeta, next: IdiomWithMeta): boolean {
    return canChain(previous, next) && !usedWords.value.has(next.word)
  }

  function addEntry(idiom: IdiomWithMeta, player: Player): void {
    history.value.push({
      id: `${player}-${idiom.word}-${history.value.length}`,
      idiom,
      player,
    })
    usedWords.value.add(idiom.word)
  }

  return {
    aiLevel,
    chainHint,
    currentIdiom,
    favorites,
    hintOptions,
    history,
    isAiThinking,
    learnedIdioms,
    message,
    roundCount,
    status,
    totalIdiomCount,
    resetGame,
    setAiLevel,
    showHints,
    startWithRandomIdiom,
    submitHumanIdiom,
    toggleFavorite,
  }
})

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    const words = stored ? (JSON.parse(stored) as string[]) : []
    return new Set(words)
  } catch {
    return new Set()
  }
}

function saveFavorites(favorites: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
}
