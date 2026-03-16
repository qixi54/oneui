<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { Component } from "vue";
import { resolveIcon } from "../../utils/icon";

export interface SectionBlockProps {
  title: string;
  /** 图标：lucide icon name（kebab-case，如 "file-text"）或 Vue 组件对象。传入无法解析的字符串时不渲染。 */
  icon?: string | Component;
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
const iconComponent = computed(() => resolveIcon(props.icon));

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
        <component
          v-if="iconComponent"
          :is="iconComponent"
          class="of-section-block__icon"
          :size="14"
          aria-hidden="true"
        />
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
  border: 1px solid var(--of-border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--of-color-bg-elevated);
  box-sizing: border-box;
  width: 100%;
}

.of-section-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--of-color-gray-50);
  cursor: pointer;
  user-select: none;
  min-height: 36px;
  box-sizing: border-box;
}

.of-section-block__header:hover {
  background: var(--of-color-gray-100);
}

.of-section-block__header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.of-section-block__header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.of-section-block__icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.of-section-block__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--of-color-text-primary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-section-block__status-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.6;
  white-space: nowrap;
  flex-shrink: 0;
}

.of-section-block__action-btn {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border: 1px solid var(--of-border-color);
  border-radius: 4px;
  background: var(--of-color-bg-elevated);
  color: var(--of-color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.of-section-block__action-btn:hover {
  background: var(--of-color-gray-100);
  border-color: var(--of-color-gray-300);
  color: var(--of-color-text-primary);
}

.of-section-block__action-btn--save {
  border-color: var(--of-color-primary-500);
  background: var(--of-color-primary-500);
  color: var(--of-color-primary-foreground);
}

.of-section-block__action-btn--save:hover {
  background: var(--of-color-primary-700);
  border-color: var(--of-color-primary-700);
  color: var(--of-color-primary-foreground);
}

.of-section-block__collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}

.of-section-block__collapse-btn:hover {
  background: var(--of-border-color);
}

.of-section-block__collapse-icon {
  font-size: 14px;
  color: var(--of-color-gray-400);
  line-height: 1;
  display: inline-block;
  transition: transform 0.2s;
}

.of-section-block__collapse-icon--collapsed {
  transform: rotate(-90deg);
}

/* Body collapse animation via max-height */
.of-section-block__body-wrapper {
  max-height: 2000px;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.of-section-block__body-wrapper--collapsed {
  max-height: 0;
}

.of-section-block__body {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--of-color-text-secondary);
  box-sizing: border-box;
}
</style>
