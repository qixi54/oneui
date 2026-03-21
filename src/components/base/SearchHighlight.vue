<script setup lang="ts">
import type { SearchHighlight } from "../../composables/useSearch";

defineProps<{
  segments: SearchHighlight[];
}>();

defineOptions({ inheritAttrs: false });

</script>

<template>
  <span class="of-search-hl" v-bind="$attrs">
    <template v-for="(seg, i) in segments" :key="i">
      <mark v-if="seg.match" class="of-search-hl__match">{{ seg.text }}</mark>
      <span v-else>{{ seg.text }}</span>
    </template>
  </span>
</template>

<style scoped>
.of-search-hl__match {
  background: var(--of-surface-selected, #fef3c7);
  color: var(--of-text-strong, #92400e);
  border-radius: 2px;
  padding: 0 1px;
}
</style>
