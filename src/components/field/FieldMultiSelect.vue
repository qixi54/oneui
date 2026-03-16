<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CellValue, FieldDef } from '@/components/table/FieldCell.vue'

const props = defineProps<{ value?: CellValue; field: FieldDef }>()
const emit = defineEmits<{ commit: [value: CellValue]; cancel: []; tabNext: [] }>()

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' })
const isOpen = ref(true)

const options = computed(() => props.field.options ?? [])
const draftValues = ref<string[]>([])
const activeIndex = ref(0)

const selectedOptions = computed(() => {
  const set = new Set(draftValues.value)
  return options.value.filter((opt) => set.has(opt.value))
})

function initDraft() {
  draftValues.value = Array.isArray(props.value)
    ? props.value.filter((v): v is string => typeof v === 'string')
    : []
}

function updateDropdownPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 220)}px`,
  }
}

function toggleValue(optValue: string) {
  const idx = draftValues.value.indexOf(optValue)
  if (idx >= 0) {
    draftValues.value = draftValues.value.filter((v) => v !== optValue)
    return
  }
  draftValues.value = [...draftValues.value, optValue]
}

function commitAndClose() {
  isOpen.value = false
  emit('commit', [...draftValues.value])
}

function cancelAndClose() {
  if (!isOpen.value) return
  isOpen.value = false
  emit('cancel')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, Math.max(options.value.length - 1, 0))
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    const current = options.value[activeIndex.value]
    if (current) toggleValue(current.value)
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelAndClose()
    return
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    commitAndClose()
    emit('tabNext')
  }
}

function onWindowPointerDown(e: MouseEvent) {
  const target = e.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  commitAndClose()
}

onMounted(() => {
  initDraft()
  nextTick(() => {
    updateDropdownPosition()
    triggerRef.value?.focus()
  })
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('mousedown', onWindowPointerDown, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('mousedown', onWindowPointerDown, true)
})

watch(
  () => props.value,
  () => {
    initDraft()
  }
)
</script>

<template>
  <div
    ref="triggerRef"
    class="of-field-multiselect"
    tabindex="0"
    @keydown="onKeydown"
  >
    <div v-if="selectedOptions.length" class="of-field-multiselect__chips">
      <span
        v-for="opt in selectedOptions"
        :key="opt.value"
        class="of-field-multiselect__badge"
        :style="opt.color ? { background: opt.color } : undefined"
      >
        {{ opt.label }}
      </span>
    </div>
    <span v-else class="of-field-multiselect__placeholder">—</span>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="of-field-multiselect__dropdown"
        :style="dropdownStyle"
      >
        <div
          v-for="(opt, i) in options"
          :key="opt.value"
          class="of-field-multiselect__option"
          :class="{ active: i === activeIndex, selected: draftValues.includes(opt.value) }"
          @mouseenter="activeIndex = i"
          @click.stop="toggleValue(opt.value)"
        >
          <input
            class="of-field-multiselect__checkbox"
            type="checkbox"
            tabindex="-1"
            :checked="draftValues.includes(opt.value)"
            @change.prevent
          >
          <span v-if="opt.color" class="of-field-multiselect__badge" :style="{ background: opt.color }">{{ opt.label }}</span>
          <span v-else>{{ opt.label }}</span>
        </div>
        <div class="of-field-multiselect__actions">
          <button class="of-field-multiselect__btn" type="button" @click.stop="cancelAndClose">取消</button>
          <button class="of-field-multiselect__btn of-field-multiselect__btn--primary" type="button" @click.stop="commitAndClose">完成</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.of-field-multiselect {
  width: 100%;
  min-height: 28px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  outline: none;
}

.of-field-multiselect__chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.of-field-multiselect__placeholder {
  font-size: 13px;
  color: var(--of-color-text-tertiary);
}

.of-field-multiselect__dropdown {
  position: fixed;
  z-index: 9999;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-border-color);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.of-field-multiselect__option {
  min-height: 30px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.of-field-multiselect__option:hover,
.of-field-multiselect__option.active {
  background: var(--of-color-bg-hover);
}

.of-field-multiselect__option.selected {
  font-weight: 600;
}

.of-field-multiselect__checkbox {
  margin: 0;
  pointer-events: none;
}

.of-field-multiselect__badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--of-color-text-inverse);
  line-height: 18px;
  background: var(--of-color-primary-500);
}

.of-field-multiselect__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--of-color-border-light);
  padding: 8px;
}

.of-field-multiselect__btn {
  border: 1px solid var(--of-border-color);
  background: var(--of-color-bg-elevated);
  border-radius: 4px;
  font-size: 12px;
  padding: 3px 10px;
  cursor: pointer;
}

.of-field-multiselect__btn--primary {
  border-color: var(--of-color-primary-500);
  background: var(--of-color-primary-500);
  color: var(--of-color-text-inverse);
}
</style>
