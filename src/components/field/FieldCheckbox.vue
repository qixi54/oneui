<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value?: unknown; field: import('@/components/table/FieldCell.vue').FieldDef }>()
const emit = defineEmits<{ commit: [value: boolean]; cancel: []; tabNext: [] }>()

const checked = computed(() => Boolean(props.value))

function toggle() {
  emit('commit', !checked.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('cancel')
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    emit('tabNext')
  }
}
</script>

<template>
  <div class="of-field-checkbox" tabindex="0" @click.stop="toggle" @keydown="onKeydown">
    <span class="of-field-checkbox__icon">{{ checked ? '☑' : '☐' }}</span>
  </div>
</template>

<style scoped>
.of-field-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 28px;
  cursor: pointer;
  font-size: 16px;
}
</style>
