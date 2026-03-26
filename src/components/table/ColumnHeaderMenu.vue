<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { ArrowUp, ArrowDown, EyeOff, Copy, Trash2 } from "lucide-vue-next";
import FieldTypePicker from "./FieldTypePicker.vue";
import type { FieldType } from "../../types";

const props = withDefaults(
  defineProps<{
    colKey: string;
    colLabel: string;
    fieldType?: FieldType;
    sortOrder?: "asc" | "desc" | null;
    visible: boolean;
    x: number;
    y: number;
    deletable?: boolean;
  }>(),
  {
    fieldType: undefined,
    sortOrder: null,
    deletable: true,
  },
);

const emit = defineEmits<{
  close: [];
  rename: [colKey: string, newName: string];
  "change-type": [colKey: string, newType: FieldType];
  sort: [colKey: string, direction: "asc" | "desc"];
  hide: [colKey: string];
  delete: [colKey: string];
  duplicate: [colKey: string];
}>();

const renameInput = ref<HTMLInputElement | null>(null);
const showTypePicker = ref(false);

const TYPE_LABELS: Record<string, string> = {
  text: "文本",
  number: "数字",
  select: "单选",
  multi_select: "多选",
  date: "日期",
  datetime: "日期时间",
  checkbox: "复选框",
  url: "链接",
  email: "邮箱",
  phone: "电话",
  rating: "评分",
  currency: "货币",
  richtext: "富文本",
  auto_number: "自动编号",
  creator: "创建者",
  progress: "进度",
  relation: "关联",
  attachment: "附件",
  formula: "公式",
  user: "用户",
};

const typeLabel = computed(() => TYPE_LABELS[props.fieldType ?? ""] ?? props.fieldType ?? "");

onMounted(() => nextTick(() => renameInput.value?.select()));

function handleRename(e: Event) {
  const input = e.target as HTMLInputElement;
  const newName = input.value.trim();
  if (newName && newName !== props.colLabel) {
    emit("rename", props.colKey, newName);
  }
  emit("close");
}

function handleTypeChange(type: FieldType) {
  emit("change-type", props.colKey, type);
  showTypePicker.value = false;
  emit("close");
}

function handleDelete() {
  emit("delete", props.colKey);
  emit("close");
}

// 确保菜单不溢出视口
const menuStyle = computed(() => {
  const style: Record<string, string> = {};
  style.left = `${props.x}px`;
  style.top = `${props.y}px`;
  return style;
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="of-col-menu-overlay">
      <button
        type="button"
        class="of-col-menu-overlay__hitarea"
        aria-label="关闭列菜单"
        @click="emit('close')"
      />
      <div class="of-col-menu" :style="menuStyle">
        <!-- 重命名 -->
        <div class="of-col-menu__section">
          <input
            ref="renameInput"
            class="of-col-menu__rename-input"
            :value="colLabel"
            aria-label="字段名称"
            placeholder="字段名称"
            @keydown.enter="handleRename"
            @keydown.escape="emit('close')"
          />
        </div>

        <div class="of-col-menu__divider" />

        <!-- 字段类型 -->
        <button class="of-col-menu__item" @click="showTypePicker = !showTypePicker">
          <span>字段类型</span>
          <span class="of-col-menu__item-value">{{ typeLabel }}</span>
        </button>

        <div v-if="showTypePicker" class="of-col-menu__sub">
          <FieldTypePicker :current-type="fieldType" @select="handleTypeChange" />
        </div>

        <div class="of-col-menu__divider" />

        <!-- 排序 -->
        <button
          class="of-col-menu__item"
          @click="
            emit('sort', colKey, 'asc');
            emit('close');
          "
        >
          <ArrowUp :size="14" />
          <span>升序排序</span>
        </button>
        <button
          class="of-col-menu__item"
          @click="
            emit('sort', colKey, 'desc');
            emit('close');
          "
        >
          <ArrowDown :size="14" />
          <span>降序排序</span>
        </button>

        <div class="of-col-menu__divider" />

        <!-- 隐藏 / 复制 -->
        <button
          class="of-col-menu__item"
          @click="
            emit('hide', colKey);
            emit('close');
          "
        >
          <EyeOff :size="14" />
          <span>隐藏列</span>
        </button>
        <button
          class="of-col-menu__item"
          @click="
            emit('duplicate', colKey);
            emit('close');
          "
        >
          <Copy :size="14" />
          <span>复制列</span>
        </button>

        <!-- 删除 -->
        <template v-if="deletable">
          <div class="of-col-menu__divider" />
          <button class="of-col-menu__item of-col-menu__item--danger" @click="handleDelete">
            <Trash2 :size="14" />
            <span>删除列</span>
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.of-col-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--of-z-overlay);
}

.of-col-menu-overlay__hitarea {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  cursor: default;
}

.of-col-menu {
  position: fixed;
  min-width: 220px;
  background: var(--of-surface-elevated, var(--of-color-bg-elevated, #fff));
  border: 1px solid var(--of-border-default, var(--of-border-subtle, var(--of-color-gray-200, #e5e7eb)));
  border-radius: var(--of-radius-lg, 8px);
  box-shadow: var(--of-elevation-dropdown, var(--of-shadow-dropdown));
  padding: var(--of-spacing-1) 0;
  z-index: var(--of-z-overlay);
}

.of-col-menu__section {
  padding: var(--of-spacing-1) var(--of-spacing-2);
}

.of-col-menu__rename-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--of-border-active, var(--of-border-strong, var(--of-color-gray-300, #d1d5db)));
  background: transparent;
  padding: var(--of-spacing-1_5) var(--of-spacing-1);
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-text-primary, #1a1a1a));
  outline: none;
  font-family: inherit;
}

.of-col-menu__rename-input:focus {
  border-bottom-color: var(--of-border-active, var(--of-border-strong, var(--of-color-gray-400, #9ca3af)));
}

.of-col-menu__rename-input:focus-visible,
.of-col-menu__item:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-col-menu__divider {
  height: 1px;
  background: var(--of-border-divider, var(--of-border-subtle, var(--of-color-gray-100, #f3f4f6)));
  margin: var(--of-spacing-1) 0;
}

.of-col-menu__item {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  width: 100%;
  padding: var(--of-spacing-1_5) var(--of-spacing-3);
  border: none;
  background: transparent;
  font-size: var(--of-font-size-base);
  color: var(--of-text-primary, var(--of-color-text-primary, var(--of-color-gray-700, #374151)));
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.of-col-menu__item:hover {
  background: var(--of-surface-muted, var(--of-color-bg-hover, var(--of-color-gray-50, #f9fafb)));
}

.of-col-menu__item-value {
  margin-left: auto;
  font-size: var(--of-font-size-sm);
  color: var(--of-text-tertiary, var(--of-color-text-tertiary, var(--of-color-gray-400, #9ca3af)));
}

.of-col-menu__item--danger {
  color: var(--of-color-error, #dc2626);
}

.of-col-menu__item--danger:hover {
  background: var(--of-color-error-50, #fef2f2);
}

.of-col-menu__sub {
  padding: var(--of-spacing-1) var(--of-spacing-2);
}
</style>
