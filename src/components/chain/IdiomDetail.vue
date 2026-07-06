<script setup lang="ts">
import type { IdiomWithMeta } from '../../types/idiom'

defineProps<{
  idiom?: IdiomWithMeta
  isFavorite: boolean
}>()

defineEmits<{
  toggleFavorite: [word: string]
}>()
</script>

<template>
  <section class="idiom-detail" aria-label="成语释义">
    <div class="section-title">
      <h2>当前学习</h2>
      <span v-if="idiom">{{ idiom.difficulty }}</span>
    </div>

    <div v-if="idiom" class="detail-content">
      <div class="detail-heading">
        <div>
          <strong>{{ idiom.word }}</strong>
          <p>{{ idiom.pinyin }}</p>
        </div>
        <button class="icon-text-button" type="button" @click="$emit('toggleFavorite', idiom.word)">
          {{ isFavorite ? '已收藏' : '收藏' }}
        </button>
      </div>

      <dl>
        <dt>释义</dt>
        <dd>{{ idiom.definition }}</dd>

        <template v-if="idiom.example">
          <dt>例句</dt>
          <dd>{{ idiom.example }}</dd>
        </template>

        <dt>接龙</dt>
        <dd>首字「{{ idiom.firstChar }}」，尾字「{{ idiom.lastChar }}」。</dd>
      </dl>
    </div>

    <p v-else class="empty-note">每出现一个成语，这里会显示拼音、释义和例句。</p>
  </section>
</template>
