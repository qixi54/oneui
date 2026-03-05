<script setup lang="ts">
import { computed } from "vue";

interface PersonOption {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  color?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    people: PersonOption[];
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    placeholder: "请选择负责人",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  change: [value: string | null];
}>();

const selectedId = computed({
  get: () => props.modelValue,
  set: (value: string | null) => {
    emit("update:modelValue", value);
    emit("change", value);
  },
});

const selectedPerson = computed(() => props.people.find((item) => item.id === selectedId.value) ?? null);

function fallbackText(name: string) {
  return (name || "?").trim().slice(0, 1).toUpperCase();
}
</script>

<template>
  <div class="of-person-panel" :class="{ disabled }">
    <label class="of-person-panel__label">负责人</label>
    <div class="of-person-panel__row">
      <div
        v-if="selectedPerson"
        class="of-person-panel__avatar"
        :style="{ background: selectedPerson.color || 'var(--of-color-primary-500)' }"
      >
        <img v-if="selectedPerson.avatar" :src="selectedPerson.avatar" :alt="selectedPerson.name" />
        <span v-else>{{ fallbackText(selectedPerson.name) }}</span>
      </div>
      <div v-else class="of-person-panel__avatar empty">-</div>

      <select v-model="selectedId" class="of-person-panel__select" :disabled="disabled">
        <option :value="null">{{ placeholder }}</option>
        <option v-for="person in people" :key="person.id" :value="person.id">
          {{ person.name }}<template v-if="person.title"> · {{ person.title }}</template>
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.of-person-panel {
  display: grid;
  gap: 8px;
}

.of-person-panel__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--of-color-gray-700);
}

.of-person-panel__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.of-person-panel__avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.of-person-panel__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.of-person-panel__avatar.empty {
  background: var(--of-color-gray-200);
  color: var(--of-color-gray-500);
}

.of-person-panel__select {
  flex: 1;
  min-width: 0;
  height: 32px;
  border: 1px solid var(--of-color-gray-200);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--of-color-bg-elevated);
  color: var(--of-color-text);
  font-size: 13px;
}

.of-person-panel.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
