<script setup lang="ts">
import type { ChainEntry } from '../../types/idiom'

defineProps<{
  entries: ChainEntry[]
}>()
</script>

<template>
  <section class="chain-history" aria-label="接龙记录">
    <div class="section-title">
      <h2>接龙记录</h2>
      <span>{{ entries.length }} 步</span>
    </div>

    <div v-if="entries.length > 0" class="timeline">
      <article v-for="entry in entries" :key="entry.id" class="chain-entry" :class="entry.player">
        <span class="player-badge">{{ entry.player === 'human' ? '你' : 'AI' }}</span>
        <div>
          <strong>{{ entry.idiom.word }}</strong>
          <p>{{ entry.idiom.pinyin }}</p>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <strong>还没有开始</strong>
      <p>输入一个成语，或者让 AI 先手。</p>
    </div>
  </section>
</template>
