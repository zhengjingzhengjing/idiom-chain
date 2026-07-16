<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { AI_LEVEL_LABELS, AiLevel, GAME_STATUS_LABELS, GameStatus } from '../enums/idiom'
import { useGameStore } from '../stores/gameStore'
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
  isAiThinking,
  learnedIdioms,
  message,
  roundCount,
  status,
  totalIdiomCount,
} = storeToRefs(game)

const input = ref('')
const aiLevels = Object.values(AiLevel)

const canSubmit = computed(
  () => input.value.trim().length > 0 && !isAiThinking.value && status.value !== GameStatus.Won && status.value !== GameStatus.Lost,
)

async function submit(): Promise<void> {
  if (!canSubmit.value) {
    return
  }

  await game.submitHumanIdiom(input.value)
  input.value = ''
}

function fillHint(word: string): void {
  input.value = word
}
</script>

<template>
  <main class="app-shell">
    <section class="top-bar">
      <div>
        <p class="eyebrow">成语接龙</p>
        <h1>{{ chainHint }}</h1>
      </div>

      <div class="stats-row" aria-label="游戏统计">
        <span>词库 {{ totalIdiomCount }}</span>
        <span>回合 {{ roundCount }}</span>
        <span>{{ isAiThinking ? 'AI 思考中' : GAME_STATUS_LABELS[status] }}</span>
      </div>
    </section>

    <form class="input-panel" @submit.prevent="submit">
      <input v-model="input" type="text" autocomplete="off" placeholder="输入你的成语" :disabled="isAiThinking" />
      <button class="primary-button" type="submit" :disabled="!canSubmit">{{ isAiThinking ? '思考中' : '提交' }}</button>
      <button class="secondary-button" type="button" :disabled="isAiThinking" @click="game.showHints">提示</button>
    </form>

    <p class="message">{{ message }}</p>

    <section class="toolbar">
      <div class="level-group" aria-label="AI 难度">
        <button
          v-for="level in aiLevels"
          :key="level"
          class="segmented-button"
          :class="{ active: aiLevel === level }"
          type="button"
          :disabled="isAiThinking"
          @click="game.setAiLevel(level)"
        >
          {{ AI_LEVEL_LABELS[level] }}
        </button>
      </div>

      <div class="action-group">
        <button class="ghost-button" type="button" :disabled="isAiThinking" @click="game.startWithRandomIdiom">AI 先手</button>
        <button class="ghost-button" type="button" @click="game.resetGame">重开</button>
      </div>
    </section>

    <section class="workspace">
      <ChainHistory :entries="history" />

      <aside class="side-panel">
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

          <p v-if="hintOptions.length === 0" class="empty-note">需要时点一下提示，这里会给出可接成语。</p>
        </section>
      </aside>
    </section>

    <LearningSummary :idioms="learnedIdioms" :favorites="favorites" />
  </main>
</template>
