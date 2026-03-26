<script setup lang="ts">
import { computed } from "vue";
import { ExternalLinkIcon } from "lucide-vue-next";

const props = defineProps<{
  refId: string;
  label?: string;
  href?: string;
}>();

const emit = defineEmits<{
  click: [refId: string];
}>();

const displayLabel = computed(() => props.label ?? props.refId);

function handleClick(e: MouseEvent) {
  if (!props.href) {
    e.preventDefault();
  }
  emit("click", props.refId);
}
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    class="ref-link"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    @click="handleClick"
  >
    {{ displayLabel }}
    <ExternalLinkIcon v-if="href" class="ref-link__icon" :size="10" />
  </component>
</template>

<style scoped>
.ref-link {
  display: inline-flex;
  align-items: center;
  gap: var(--of-spacing-0_75);
  background: var(--of-surface-selected, var(--of-color-gray-100));
  border-radius: var(--of-radius-sm);
  padding: var(--of-spacing-0_5) var(--of-spacing-2);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  color: var(--of-accent-default, var(--of-text-strong));
  cursor: pointer;
  text-decoration: none;
  line-height: var(--of-line-height-normal);
  transition: var(--of-transition-fast);
  vertical-align: middle;
}

.ref-link:hover {
  background: var(--of-surface-muted, var(--of-color-gray-50));
  color: var(--of-accent-strong, var(--of-text-primary));
}

.ref-link__icon {
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
