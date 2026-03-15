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
  gap: 3px;
  background: var(--of-color-primary-50);
  border-radius: var(--of-radius-sm);
  padding: 2px 8px;
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--of-color-primary-500) !important;
  cursor: pointer;
  text-decoration: none;
  line-height: 1.5;
  transition: var(--of-transition-fast);
  vertical-align: middle;
}

.ref-link:hover {
  background: var(--of-color-primary-100);
  color: var(--of-color-primary-600) !important;
}

.ref-link__icon {
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
