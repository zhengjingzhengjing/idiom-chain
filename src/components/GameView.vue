<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/gameStore'
import type { AiLevel } from '../types/idiom'
import ChainHistory from './chain/ChainHistory.vue'
import IdiomDetail from './chain/IdiomDetail.vue'
import LearningSummary from './chain/LearningSummary.vue'

const game = useGameStore()
const {
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
} = storeToRefs(game)

const input = ref('')
const aiLevels: { label: string; value: AiLevel }[] = [
  { label: '轻松', value: 'easy' },
  { label: '普通', value: 'normal' },
  { label: '挑战', value: 'hard' },
]

const canSubmit = computed(() => input.value.trim().length > 0 && status.value !== 'won' && status.value !== 'lost')

function submit(): void {
  if (!canSubmit.value) {
    return
  }

  game.submitHumanIdiom(input.value)
  input.value = ''
}

function fillHint(word: string): void {
  input.value = word
}
</script>

<template>
  <main class="app-shell">
    <section class="game-header">
      <div>
        <p class="eyebrow">Vue3 单机练习</p>
        <h1>成语接龙</h1>
      </div>

      <div class="stats-row" aria-label="游戏统计">
        <span>词库 {{ totalIdiomCount }}</span>
        <span>回合 {{ roundCount }}</span>
        <span>{{ status === 'idle' ? '待开始' : status === 'playing' ? '进行中' : status === 'won' ? '胜利' : '结束' }}</span>
      </div>
    </section>

    <section class="control-band">
      <div class="level-group" aria-label="AI 难度">
        <button
          v-for="level in aiLevels"
          :key="level.value"
          class="segmented-button"
          :class="{ active: aiLevel === level.value }"
          type="button"
          @click="game.setAiLevel(level.value)"
        >
          {{ level.label }}
        </button>
      </div>

      <div class="action-group">
        <button class="ghost-button" type="button" @click="game.startWithRandomIdiom">AI 先手</button>
        <button class="ghost-button" type="button" @click="game.resetGame">重开</button>
      </div>
    </section>

    <section class="workspace">
      <div class="play-panel">
        <ChainHistory :entries="history" />

        <form class="input-panel" @submit.prevent="submit">
          <div>
            <p class="hint-label">{{ chainHint }}</p>
            <p class="message">{{ message }}</p>
          </div>

          <div class="input-row">
            <input v-model="input" type="text" autocomplete="off" placeholder="输入你的成语" />
            <button class="primary-button" type="submit" :disabled="!canSubmit">提交</button>
            <button class="secondary-button" type="button" @click="game.showHints">提示</button>
          </div>
        </form>
      </div>

      <aside class="study-panel">
        <IdiomDetail
          :idiom="currentIdiom"
          :is-favorite="currentIdiom ? favorites.has(currentIdiom.word) : false"
          @toggle-favorite="game.toggleFavorite"
        />

        <section class="hint-list" aria-label="提示候选">
          <div class="section-title">
            <h2>提示候选</h2>
            <span>{{ hintOptions.length }} 个</span>
          </div>

          <button
            v-for="idiom in hintOptions"
            :key="idiom.word"
            class="hint-option"
            type="button"
            @click="fillHint(idiom.word)"
          >
            <strong>{{ idiom.word }}</strong>
            <span>{{ idiom.definition }}</span>
          </button>

          <p v-if="hintOptions.length === 0" class="empty-note">需要时点一下提示，这里会放出可接成语。</p>
        </section>
      </aside>
    </section>

    <LearningSummary :idioms="learnedIdioms" :favorites="favorites" />
  </main>
</template>
