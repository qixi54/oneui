<script setup lang="ts">
import { ref } from "vue";
import type { CellValue, FieldDef } from "@/components/table/FieldCell.vue";

const props = defineProps<{ value?: CellValue; field: FieldDef }>();
const emit = defineEmits<{ commit: [value: CellValue]; cancel: []; tabNext: [] }>();

const hoverIndex = ref(0);
const maxStars = props.field.max ?? 5;
const currentValue = Number(props.value ?? 0);

function select(n: number) {
  emit("commit", n);
}
</script>

<template>
  <div class="of-field-rating" tabindex="0" role="radiogroup" aria-label="评分" @keydown.escape="emit('cancel')">
    <button
      v-for="n in maxStars"
      :key="n"
      class="of-field-rating__star"
      :class="{ filled: n <= (hoverIndex || currentValue) }"
      type="button"
      :aria-label="`评分 ${n} 星`"
      @mouseenter="hoverIndex = n"
      @mouseleave="hoverIndex = 0"
      @focus="hoverIndex = n"
      @blur="hoverIndex = 0"
      @click.stop="select(n)"
    >
      ★
    </button>
  </div>
</template>

<style scoped>
.of-field-rating {
  display: flex;
  align-items: center;
  padding: var(--of-spacing-0_5) var(--of-spacing-1);
}

.of-field-rating:focus-visible,
.of-field-rating__star:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-field-rating__star {
  font-size: var(--of-font-size-xl);
  cursor: pointer;
  color: var(--of-text-tertiary, var(--of-color-gray-300, #ccc));
  transition: color 0.1s;
}

.of-field-rating__star.filled {
  color: var(--of-accent-strong, var(--of-text-strong));
}
</style>
