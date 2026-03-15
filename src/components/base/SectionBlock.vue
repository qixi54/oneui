<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

export interface SectionBlockProps {
  title: string;
  icon?: string;
  status?: "pending" | "updating" | "done" | "editing";
  collapsed?: boolean;
  editable?: boolean;
  statusLabels?: Record<string, string>;
}

defineOptions({ name: "SectionBlock" });

const props = withDefaults(defineProps<SectionBlockProps>(), {
  icon: undefined,
  status: undefined,
  collapsed: false,
  editable: false,
  statusLabels: undefined,
});

const emit = defineEmits<{
  "update:collapsed": [value: boolean];
  edit: [];
  save: [];
}>();

defineSlots<{
  default?: () => unknown;
  editor?: () => unknown;
  "header-extra"?: () => unknown;
}>();

interface StatusTone {
  background: string;
  text: string;
}

const STATUS_TONE_MAP: Record<NonNullable<SectionBlockProps["status"]>, StatusTone> = {
  pending: { background: "var(--of-color-gray-100)", text: "var(--of-color-gray-400)" },
  updating: { background: "var(--of-color-primary-50)", text: "var(--of-color-primary-500)" },
  done: { background: "var(--of-color-success-light)", text: "var(--of-badge-green-text)" },
  editing: { background: "var(--of-color-primary-50)", text: "var(--of-color-primary-500)" },
};

const DEFAULT_STATUS_LABELS: Record<NonNullable<SectionBlockProps["status"]>, string> = {
  pending: "待处理",
  updating: "更新中",
  done: "已完成",
  editing: "编辑中",
};

const statusTone = computed<StatusTone | null>(() => {
  if (!props.status) return null;
  return STATUS_TONE_MAP[props.status] ?? null;
});

const statusLabel = computed<string | null>(() => {
  if (!props.status) return null;
  return props.statusLabels?.[props.status] ?? DEFAULT_STATUS_LABELS[props.status] ?? props.status;
});

const statusBadgeStyle = computed<CSSProperties>(() => {
  if (!statusTone.value) return {};
  return {
    backgroundColor: statusTone.value.background,
    color: statusTone.value.text,
  };
});

const blockStyle = computed<CSSProperties>(() => {
  if (props.status === "editing") {
    return {
      borderColor: "var(--of-color-primary-500)",
      boxShadow: "0 0 0 3px color-mix(in srgb, var(--of-color-primary-500) 8%, transparent)",
    };
  }
  if (props.status === "done") {
    return { borderColor: "var(--of-color-success-light)" };
  }
  return {};
});

const isEditing = computed(() => props.status === "editing");
const showEditBtn = computed(() => props.editable && props.status === "done");

function toggleCollapse() {
  emit("update:collapsed", !props.collapsed);
}

function onEdit() {
  emit("edit");
}

function onSave() {
  emit("save");
}
</script>

<template>
  <div
    class="of-section-block"
    :class="{
      'of-section-block--collapsed': collapsed,
      'of-section-block--editing': isEditing,
      'of-section-block--done': status === 'done',
    }"
    :style="blockStyle"
  >
    <!-- Header -->
    <div class="of-section-block__header" @click="toggleCollapse">
      <div class="of-section-block__header-left">
        <span v-if="icon" class="of-section-block__icon" aria-hidden="true">{{ icon }}</span>
        <span class="of-section-block__title">{{ title }}</span>
        <span
          v-if="status"
          class="of-section-block__status-badge"
          :style="statusBadgeStyle"
        >{{ statusLabel }}</span>
      </div>

      <div class="of-section-block__header-right" @click.stop>
        <slot name="header-extra" />

        <button
          v-if="isEditing"
          type="button"
          class="of-section-block__action-btn of-section-block__action-btn--save"
          @click="onSave"
        >
          保存
        </button>

        <button
          v-else-if="showEditBtn"
          type="button"
          class="of-section-block__action-btn"
          @click="onEdit"
        >
          编辑
        </button>

        <button
          type="button"
          class="of-section-block__collapse-btn"
          :aria-expanded="!collapsed"
          :aria-label="collapsed ? '展开' : '折叠'"
          @click="toggleCollapse"
        >
          <span
            class="of-section-block__collapse-icon"
            :class="{ 'of-section-block__collapse-icon--collapsed': collapsed }"
            aria-hidden="true"
          >▾</span>
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="of-section-block__body-wrapper" :class="{ 'of-section-block__body-wrapper--collapsed': collapsed }">
      <div class="of-section-block__body">
        <template v-if="isEditing">
          <slot name="editor" />
        </template>
        <template v-else>
          <slot />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.of-section-block {
  border: 1px solid var(--of-border-color) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  background: var(--of-color-bg-elevated) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

.of-section-block__header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  padding: 8px 12px !important;
  background: var(--of-color-gray-50) !important;
  cursor: pointer !important;
  user-select: none !important;
  min-height: 36px !important;
  box-sizing: border-box !important;
}

.of-section-block__header:hover {
  background: var(--of-color-gray-100) !important;
}

.of-section-block__header-left {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex: 1 !important;
  min-width: 0 !important;
}

.of-section-block__header-right {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-shrink: 0 !important;
}

.of-section-block__icon {
  font-size: 14px !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
}

.of-section-block__title {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--of-color-text-primary) !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.of-section-block__status-badge {
  display: inline-flex !important;
  align-items: center !important;
  padding: 1px 7px !important;
  border-radius: 4px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  line-height: 1.6 !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

.of-section-block__action-btn {
  display: inline-flex !important;
  align-items: center !important;
  padding: 2px 10px !important;
  border: 1px solid var(--of-border-color) !important;
  border-radius: 4px !important;
  background: var(--of-color-bg-elevated) !important;
  color: var(--of-color-text-secondary) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  line-height: 1.5 !important;
  cursor: pointer !important;
  transition: background 0.15s, border-color 0.15s, color 0.15s !important;
  white-space: nowrap !important;
}

.of-section-block__action-btn:hover {
  background: var(--of-color-gray-100) !important;
  border-color: var(--of-color-gray-300) !important;
  color: var(--of-color-text-primary) !important;
}

.of-section-block__action-btn--save {
  border-color: var(--of-color-primary-500) !important;
  background: var(--of-color-primary-500) !important;
  color: var(--of-color-primary-foreground) !important;
}

.of-section-block__action-btn--save:hover {
  background: var(--of-color-primary-700) !important;
  border-color: var(--of-color-primary-700) !important;
  color: var(--of-color-primary-foreground) !important;
}

.of-section-block__collapse-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 4px !important;
  background: transparent !important;
  cursor: pointer !important;
  transition: background 0.15s !important;
  flex-shrink: 0 !important;
}

.of-section-block__collapse-btn:hover {
  background: var(--of-border-color) !important;
}

.of-section-block__collapse-icon {
  font-size: 14px !important;
  color: var(--of-color-gray-400) !important;
  line-height: 1 !important;
  display: inline-block !important;
  transition: transform 0.2s !important;
}

.of-section-block__collapse-icon--collapsed {
  transform: rotate(-90deg) !important;
}

/* Body collapse animation via max-height */
.of-section-block__body-wrapper {
  max-height: 2000px !important;
  overflow: hidden !important;
  transition: max-height 0.25s ease !important;
}

.of-section-block__body-wrapper--collapsed {
  max-height: 0 !important;
}

.of-section-block__body {
  padding: 10px 12px !important;
  font-size: 12px !important;
  line-height: 1.8 !important;
  color: var(--of-color-text-secondary) !important;
  box-sizing: border-box !important;
}
</style>
