<script setup lang="ts">
import { ref } from 'vue'
import type { CellValue, FieldDef } from '@/components/table/FieldCell.vue'

const props = defineProps<{ value?: CellValue; field: FieldDef }>()
const emit = defineEmits<{ commit: [value: CellValue]; cancel: []; tabNext: [] }>()

const hoverIndex = ref(0)
const maxStars = props.field.max ?? 5
const currentValue = Number(props.value ?? 0)

function select(n: number) {
  emit('commit', n)
}
</script>

<template>
  <div class="of-field-rating" @keydown.escape="emit('cancel')" tabindex="0">
    <span
      v-for="n in maxStars"
      :key="n"
      class="of-field-rating__star"
      :class="{ filled: n <= (hoverIndex || currentValue) }"
      @mouseenter="hoverIndex = n"
      @mouseleave="hoverIndex = 0"
      @click.stop="select(n)"
    >★</span>
  </div>
</template>

<style scoped>
.of-field-rating {
  display: flex;
  align-items: center;
  padding: 2px 4px;
}

.of-field-rating__star {
  font-size: 18px;
  cursor: pointer;
  color: var(--of-color-gray-300, #ccc);
  transition: color 0.1s;
}

.of-field-rating__star.filled {
  color: #faad14;
}
</style>
