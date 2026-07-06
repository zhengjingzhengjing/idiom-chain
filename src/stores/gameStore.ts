import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
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
import type { AiLevel, ChainEntry, GameStatus, IdiomWithMeta, Player } from '../types/idiom'

const FAVORITES_KEY = 'idiom-chain:favorites'

export const useGameStore = defineStore('game', () => {
  const history = ref<ChainEntry[]>([])
  const usedWords = ref<Set<string>>(new Set())
  const favorites = ref<Set<string>>(loadFavorites())
  const status = ref<GameStatus>('idle')
  const aiLevel = ref<AiLevel>('normal')
  const message = ref('输入任意成语开始接龙，系统会自动回应。')
  const hintOptions = ref<IdiomWithMeta[]>([])

  const lastEntry = computed(() => history.value.at(-1))
  const currentIdiom = computed(() => lastEntry.value?.idiom)
  const chainHint = computed(() => getChainHint(currentIdiom.value))
  const roundCount = computed(() => Math.ceil(history.value.length / 2))
  const totalIdiomCount = computed(() => getTotalIdiomCount())
  const learnedIdioms = computed(() => history.value.map((entry) => entry.idiom))

  function submitHumanIdiom(input: string): void {
    const word = normalizeIdiomInput(input)
    const idiom = findIdiom(word) ?? createCustomIdiom(word)

    hintOptions.value = []

    if (status.value === 'won' || status.value === 'lost') {
      message.value = '本局已经结束，可以重新开始一局。'
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

    addEntry(idiom, 'human')

    const aiIdiom = pickAiIdiom(idiom, usedWords.value, aiLevel.value)
    if (!aiIdiom) {
      status.value = 'won'
      message.value = `接受「${idiom.word}」。你赢了！AI 已经接不上了。`
      return
    }

    addEntry(aiIdiom, 'ai')

    const nextOptions = getHintOptions(aiIdiom, usedWords.value)
    if (nextOptions.length === 0) {
      message.value = `AI 出了「${aiIdiom.word}」，你暂时没有可接选项，本局结束。`
      status.value = 'lost'
      return
    }

    status.value = 'playing'
    message.value = findIdiom(word)
      ? `AI 接了「${aiIdiom.word}」，现在轮到你。`
      : `接受词库外成语「${idiom.word}」。AI 接了「${aiIdiom.word}」，现在轮到你。`
  }

  function startWithRandomIdiom(): void {
    resetGame()
    const opening = getRandomOpeningIdiom()
    addEntry(opening, 'ai')
    status.value = 'playing'
    message.value = `AI 先手出了「${opening.word}」，你来接。`
  }

  function showHints(): void {
    if (!currentIdiom.value) {
      message.value = '还没有起始成语，可以先输入一个，或让 AI 先手。'
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
    status.value = 'idle'
    message.value = '输入任意成语开始接龙，系统会自动回应。'
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
