<script setup lang="ts">
import { useAttrs } from "vue";
import SharedContextMenu, { type ContextMenuItem } from "../ContextMenu/index.vue";

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    items: ContextMenuItem[];
    visible?: boolean;
  }>(),
  { visible: true },
);

const emit = defineEmits<{
  select: [key: string];
  close: [];
}>();

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
</script>

<template>
  <SharedContextMenu
    v-bind="{ ...props, ...attrs }"
    @select="emit('select', $event)"
    @close="emit('close')"
  />
</template>
