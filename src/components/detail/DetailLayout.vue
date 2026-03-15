<script setup lang="ts">
import { computed } from "vue";
import PropPanel from "./PropPanel.vue";
import CommentItem from "./CommentItem.vue";
import { ContentBlock } from "../editor";
import type { Task, CommentData, PropItem } from "../../types";

const props = withDefaults(
  defineProps<{
    task: Task;
    comments?: CommentData[];
    propItems?: PropItem[];
    descriptionContent?: string;
    descriptionEditable?: boolean;
  }>(),
  {
    comments: () => [],
    propItems: () => [],
    descriptionContent: "",
    descriptionEditable: false,
  },
);

const emit = defineEmits<{
  "update:descriptionContent": [value: string];
}>();

// 状态标签颜色
const statusBadgeStyle = computed(() => {
  const map: Record<string, { text: string; bg: string }> = {
    todo: { text: "var(--of-status-todo-text)", bg: "var(--of-status-todo-bg)" },
    in_progress: { text: "var(--of-status-in-progress-text)", bg: "var(--of-status-in-progress-bg)" },
    blocked: { text: "var(--of-status-blocked-text)", bg: "var(--of-status-blocked-bg)" },
    done: { text: "var(--of-status-done-text)", bg: "var(--of-status-done-bg)" },
  };
  return map[props.task.status] ?? { text: "var(--of-color-text-secondary)", bg: "var(--of-color-gray-100)" };
});

// 优先级标签颜色
const priorityBadgeStyle = computed(() => {
  const map: Record<string, { text: string; bg: string }> = {
    P0: { text: "var(--of-priority-p0-text)", bg: "var(--of-priority-p0-bg)" },
    P1: { text: "var(--of-priority-p1-text)", bg: "var(--of-priority-p1-bg)" },
    P2: { text: "var(--of-priority-p2-text)", bg: "var(--of-priority-p2-bg)" },
    P3: { text: "var(--of-priority-p3-text)", bg: "var(--of-priority-p3-bg)" },
  };
  return map[props.task.priority] ?? { text: "var(--of-color-text-secondary)", bg: "var(--of-color-gray-100)" };
});

// 状态显示文字
const statusLabel = computed(() => {
  const labelMap: Record<string, string> = {
    todo: "待处理",
    in_progress: "进行中",
    blocked: "阻塞",
    done: "已完成",
  };
  return labelMap[props.task.status] ?? props.task.status;
});

const descriptionText = computed(() => props.descriptionContent || props.task.description || "");

function onDescriptionUpdate(value: string) {
  emit("update:descriptionContent", value);
}
</script>

<template>
  <div class="detail-layout">
    <!-- 左栏：主内容 -->
    <div class="detail-layout__main">
      <!-- 任务标题 -->
      <h1 class="detail-layout__title">{{ task.title }}</h1>

      <!-- Meta 信息行 -->
      <div class="detail-layout__meta">
        <!-- 默认 meta：状态、优先级、角色 -->
        <template v-if="!$slots.meta">
          <!-- 状态徽章 -->
          <span
            class="detail-layout__badge"
            :style="{ color: statusBadgeStyle.text, backgroundColor: statusBadgeStyle.bg }"
          >
            {{ statusLabel }}
          </span>

          <!-- 优先级徽章 -->
          <span
            class="detail-layout__badge"
            :style="{ color: priorityBadgeStyle.text, backgroundColor: priorityBadgeStyle.bg }"
          >
            {{ task.priority }}
          </span>

          <!-- 角色 -->
          <span v-if="task.role" class="detail-layout__badge detail-layout__badge--role">
            {{ task.role }}
          </span>

          <!-- 指派人 -->
          <span v-if="task.assignee" class="detail-layout__meta-text">
            {{ task.assignee }}
          </span>
        </template>

        <!-- 自定义 meta 插槽 -->
        <slot name="meta" />
      </div>

      <!-- 描述区 -->
      <div class="detail-layout__section">
        <div class="detail-layout__section-title">描述</div>
        <div class="detail-layout__description">
          <slot name="description">
            <ContentBlock
              :content="descriptionText"
              :editable="descriptionEditable"
              @update:content="onDescriptionUpdate"
            />
            <p v-if="!descriptionText" class="detail-layout__desc-placeholder">
              暂无描述
            </p>
          </slot>
        </div>
      </div>

      <!-- 活动记录区 -->
      <div class="detail-layout__section">
        <div class="detail-layout__section-title">活动记录</div>
        <div class="detail-layout__comments">
          <slot name="comments">
            <div v-if="comments && comments.length > 0" class="detail-layout__comment-list">
              <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" />
            </div>
            <p v-else class="detail-layout__empty-hint">暂无活动记录</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- 右栏：属性面板 -->
    <div class="detail-layout__sidebar">
      <slot name="props">
        <PropPanel v-if="propItems && propItems.length > 0" :items="propItems" title="属性" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* ─── 容器 ─── */
.detail-layout {
  display: flex;
  align-items: flex-start;
  max-width: 1000px;
  width: 100%;
  height: auto;
  background: var(--of-color-bg-elevated);
  box-sizing: border-box;
}

/* ─── 左栏：主内容 ─── */
.detail-layout__main {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
  border-right: 1px solid var(--of-color-gray-200);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 任务标题 */
.detail-layout__title {
  font-family: var(--of-font-sans) !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  color: var(--of-color-gray-900) !important;
  line-height: 1.35;
  margin: 0 0 12px 0 !important;
  padding: 0 !important;
  word-break: break-word;
}

/* Meta 行 */
.detail-layout__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.detail-layout__badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 8px;
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  white-space: nowrap;
}

.detail-layout__badge--role {
  color: var(--of-role-default-text) !important;
  background-color: var(--of-role-default-bg);
}

.detail-layout__meta-text {
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  color: var(--of-color-gray-500) !important;
}

/* ─── 区块（描述 / 活动记录）─── */
.detail-layout__section {
  margin-bottom: 28px;
}

.detail-layout__section:last-child {
  margin-bottom: 0;
}

.detail-layout__section-title {
  font-family: var(--of-font-sans) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: var(--of-color-gray-700) !important;
  margin-bottom: 12px;
}

/* 描述内容 */
.detail-layout__description {
  min-height: 48px;
}

.detail-layout__desc-placeholder {
  font-family: var(--of-font-sans) !important;
  font-size: 14px !important;
  color: var(--of-color-gray-500) !important;
  line-height: 1.6;
  margin: 0 !important;
}

/* 评论列表 */
.detail-layout__comment-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-layout__empty-hint {
  font-family: var(--of-font-sans) !important;
  font-size: 12px !important;
  color: var(--of-color-gray-400) !important;
  margin: 0 !important;
}

/* ─── 右栏：属性面板 ─── */
.detail-layout__sidebar {
  width: 320px;
  flex-shrink: 0;
  padding: 20px;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-gray-200);
  box-sizing: border-box;
  /* 配合 detail-layout 的 border-right，去掉左边框避免双线 */
  border-left: none;
  align-self: stretch;
}

/* ─── 响应式：移动端单栏 ─── */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }

  .detail-layout__main {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--of-color-gray-200);
    padding: 20px 16px;
  }

  .detail-layout__sidebar {
    width: 100%;
    border: none;
    border-top: 1px solid var(--of-color-gray-200);
    padding: 16px;
  }
}
</style>
