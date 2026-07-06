<script setup lang="ts">
import { computed } from 'vue'
import type { IdiomWithMeta } from '../../types/idiom'

const props = defineProps<{
  idioms: IdiomWithMeta[]
  favorites: Set<string>
}>()

const uniqueIdioms = computed(() => {
  const seen = new Set<string>()
  return props.idioms.filter((idiom) => {
    if (seen.has(idiom.word)) {
      return false
    }

    seen.add(idiom.word)
    return true
  })
})

const favoriteCount = computed(() => uniqueIdioms.value.filter((idiom) => props.favorites.has(idiom.word)).length)
</script>

<template>
  <section class="summary-band" aria-label="学习总结">
    <div>
      <p class="eyebrow">本局总结</p>
      <h2>已经遇到 {{ uniqueIdioms.length }} 个成语，收藏 {{ favoriteCount }} 个。</h2>
    </div>

    <div class="summary-list">
      <span v-for="idiom in uniqueIdioms.slice(-8)" :key="idiom.word">{{ idiom.word }}</span>
      <span v-if="uniqueIdioms.length === 0">开始后这里会记录本局词汇</span>
    </div>
  </section>
</template>
