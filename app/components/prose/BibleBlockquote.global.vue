<script setup lang="ts">
import theme from '#build/ui/prose/blockquote'
import { createTV } from 'tailwind-variants'
import appConfig from '#build/app.config'

const appConfigTv = appConfig
const tv = /* @__PURE__ */ createTV(appConfigTv.ui?.tv)

const props = defineProps({
  class: { type: null, required: false },
  versionId: { type: Number, default: 111 },
  book: { type: String, default: 'GEN' },
  chapter: { type: Number, default: 1 },
  verse: { type: String, default: '1' }
})
defineSlots()

const myAppConfig = useAppConfig()
const ui = computed(() => tv({ extend: tv(theme), ...myAppConfig.ui?.prose?.blockquote || {} }))

const { data } = await useFetch('/api/bible', {
  query: {
    versionId: props.versionId,
    book: props.book,
    chapter: props.chapter,
    verse: props.verse
  }
})
</script>

<template>
  <blockquote :class="ui({ class: props.class })">
    <div v-if="data">
      <div
        data-slot="bible-renderer"
        v-html="data.passage.content"
      />
      <span class="right-0">{{ data.passage.reference }}</span>
      <p class="text-xs text-gray-500">
        {{ data.version.copyright }}
      </p>
    </div>
  </blockquote>
</template>
