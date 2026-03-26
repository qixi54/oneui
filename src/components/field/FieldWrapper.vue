<script setup lang="ts">
defineProps<{
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}>();
</script>

<template>
  <div class="of-field-standalone">
    <div v-if="label" class="of-field-standalone__label">
      {{ label }}
      <span v-if="required" class="of-field-standalone__required">*</span>
    </div>
    <div
      class="of-field-standalone__control"
      :class="{
        'of-field-standalone__control--error': error,
        'of-field-standalone__control--disabled': disabled,
      }"
    >
      <slot />
    </div>
    <span v-if="error" class="of-field-standalone__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.of-field-standalone {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-field-standalone__label {
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-text-secondary);
}

.of-field-standalone__required {
  color: var(--of-color-error);
  margin-left: var(--of-spacing-0_5);
}

.of-field-standalone__control {
  border: 1px solid var(--of-border-subtle);
  border-radius: var(--of-radius-md);
  background: var(--of-surface-elevated);
  transition: var(--of-transition-fast);
}

.of-field-standalone__control:focus-within {
  border-color: var(--of-accent-default);
  box-shadow: 0 0 0 2px var(--of-accent-soft);
}

.of-field-standalone__control--error {
  border-color: var(--of-color-error);
}

.of-field-standalone__control--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.of-field-standalone__error {
  font-size: var(--of-font-size-xs);
  color: var(--of-color-error);
}
</style>
