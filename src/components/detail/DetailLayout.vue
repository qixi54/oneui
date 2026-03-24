<script setup lang="ts">
import { computed } from "vue";
import { AlertCircle, Inbox, Loader2 } from "lucide-vue-next";
import PropPanel from "./PropPanel.vue";
import CommentItem from "./CommentItem.vue";
import { ContentBlock } from "../editor";
import type { Task, CommentData, PropItem } from "../../types";

type DetailLayoutState = "ready" | "loading" | "empty" | "error";

const props = withDefaults(
  defineProps<{
    task?: Task | null;
    title?: string;
    comments?: CommentData[];
    propItems?: PropItem[];
    descriptionContent?: string;
    descriptionEditable?: boolean;
    state?: DetailLayoutState;
    stateTitle?: string;
    stateDescription?: string;
  }>(),
  {
    task: null,
    title: "",
    comments: () => [],
    propItems: () => [],
    descriptionContent: "",
    descriptionEditable: false,
    state: "ready",
    stateTitle: "",
    stateDescription: "",
  },
);

const emit = defineEmits<{
  "update:descriptionContent": [value: string];
}>();

const displayTitle = computed(() => props.title || props.task?.title || "未命名工作区");
const isReadyState = computed(() => props.state === "ready");
const stateIcon = computed(() => {
  if (props.state === "loading") return Loader2;
  if (props.state === "error") return AlertCircle;
  return Inbox;
});
const stateTitle = computed(() => {
  if (props.stateTitle) return props.stateTitle;
  if (props.state === "loading") return "正在准备工作区";
  if (props.state === "error") return "工作区加载失败";
  if (props.state === "empty") return "暂无详情内容";
  return "";
});
const stateDescription = computed(() => {
  if (props.stateDescription) return props.stateDescription;
  if (props.state === "loading") return "请稍候，当前记录的详情数据正在整理。";
  if (props.state === "error") return "暂时无法展示当前详情，请稍后重试。";
  if (props.state === "empty") return "当前记录还没有可展示的描述、属性或活动记录。";
  return "";
});

// 状态标签颜色
const statusBadgeStyle = computed(() => {
  if (!props.task) {
    return {
      text: "var(--of-color-text-secondary)",
      bg: "var(--of-color-gray-100)",
    };
  }
  const map: Record<string, { text: string; bg: string }> = {
    todo: { text: "var(--of-status-todo-text)", bg: "var(--of-status-todo-bg)" },
    in_progress: {
      text: "var(--of-status-in-progress-text)",
      bg: "var(--of-status-in-progress-bg)",
    },
    blocked: { text: "var(--of-status-blocked-text)", bg: "var(--of-status-blocked-bg)" },
    done: { text: "var(--of-status-done-text)", bg: "var(--of-status-done-bg)" },
  };
  return (
    map[props.task.status] ?? {
      text: "var(--of-color-text-secondary)",
      bg: "var(--of-color-gray-100)",
    }
  );
});

// 优先级标签颜色
const priorityBadgeStyle = computed(() => {
  if (!props.task) {
    return {
      text: "var(--of-color-text-secondary)",
      bg: "var(--of-color-gray-100)",
    };
  }
  const map: Record<string, { text: string; bg: string }> = {
    P0: { text: "var(--of-priority-p0-text)", bg: "var(--of-priority-p0-bg)" },
    P1: { text: "var(--of-priority-p1-text)", bg: "var(--of-priority-p1-bg)" },
    P2: { text: "var(--of-priority-p2-text)", bg: "var(--of-priority-p2-bg)" },
    P3: { text: "var(--of-priority-p3-text)", bg: "var(--of-priority-p3-bg)" },
  };
  return (
    map[props.task.priority] ?? {
      text: "var(--of-color-text-secondary)",
      bg: "var(--of-color-gray-100)",
    }
  );
});

// 状态显示文字
const statusLabel = computed(() => {
  if (!props.task) return "";
  const labelMap: Record<string, string> = {
    todo: "待处理",
    in_progress: "进行中",
    blocked: "阻塞",
    done: "已完成",
  };
  return labelMap[props.task.status] ?? props.task.status;
});

const displayStatusLabel = computed(() => {
  if (!props.task) return "";
  return statusLabel.value;
});

const displayPriorityLabel = computed(() => {
  if (!props.task) return "";
  return props.task.priority;
});

const displayRoleLabel = computed(() => props.task?.role ?? "");
const displayAssigneeLabel = computed(() => props.task?.assignee ?? "");

const descriptionText = computed(() => props.descriptionContent || props.task?.description || "");

function onDescriptionUpdate(value: string) {
  emit("update:descriptionContent", value);
}
</script>

<template>
  <div class="detail-layout">
    <!-- 左栏：主内容 -->
    <div class="detail-layout__main">
      <!-- 任务标题 -->
      <h1 class="detail-layout__title">{{ displayTitle }}</h1>

      <!-- Meta 信息行 -->
      <div class="detail-layout__meta">
        <!-- 默认 meta：状态、优先级、角色 -->
        <template v-if="props.task && !$slots.meta">
          <!-- 状态徽章 -->
          <span
            class="detail-layout__badge"
            :style="{ color: statusBadgeStyle.text, backgroundColor: statusBadgeStyle.bg }"
          >
            {{ displayStatusLabel }}
          </span>

          <!-- 优先级徽章 -->
          <span
            class="detail-layout__badge"
            :style="{ color: priorityBadgeStyle.text, backgroundColor: priorityBadgeStyle.bg }"
          >
            {{ displayPriorityLabel }}
          </span>

          <!-- 角色 -->
          <span v-if="displayRoleLabel" class="detail-layout__badge detail-layout__badge--role">
            {{ displayRoleLabel }}
          </span>

          <!-- 指派人 -->
          <span v-if="displayAssigneeLabel" class="detail-layout__meta-text">
            {{ displayAssigneeLabel }}
          </span>
        </template>

        <!-- 自定义 meta 插槽 -->
        <slot name="meta" />
      </div>

      <div v-if="!isReadyState" class="detail-layout__state" :data-role="`detail-state-${props.state}`">
        <component :is="stateIcon" class="detail-layout__state-icon" :size="20" />
        <div class="detail-layout__state-copy">
          <div class="detail-layout__state-title">{{ stateTitle }}</div>
          <p class="detail-layout__state-description">{{ stateDescription }}</p>
        </div>
      </div>

      <template v-else>
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
              <p v-if="!descriptionText" class="detail-layout__desc-placeholder">暂无描述</p>
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

        <div v-if="$slots.footer" class="detail-layout__footer">
          <slot name="footer" />
        </div>
      </template>
    </div>

    <!-- 右栏：属性面板 -->
    <div v-if="isReadyState" class="detail-layout__sidebar">
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
  padding: var(--of-spacing-6) var(--of-spacing-8);
  border-right: 1px solid var(--of-color-gray-200);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 任务标题 */
.detail-layout__title {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-2xl);
  font-weight: var(--of-font-weight-bold);
  color: var(--of-color-gray-900);
  line-height: 1.35;
  margin: 0 0 var(--of-spacing-3) 0;
  padding: 0;
  word-break: break-word;
}

/* Meta 行 */
.detail-layout__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--of-spacing-2_5);
  margin-bottom: var(--of-spacing-6);
}

.detail-layout__badge {
  display: inline-flex;
  align-items: center;
  padding: var(--of-spacing-0_75) var(--of-spacing-2_5);
  border-radius: var(--of-radius-lg);
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  font-weight: var(--of-font-weight-medium);
  white-space: nowrap;
}

.detail-layout__badge--role {
  color: var(--of-text-secondary);
  background-color: var(--of-surface-muted);
}

.detail-layout__meta-text {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-gray-500);
}

/* ─── 区块（描述 / 活动记录）─── */
.detail-layout__section {
  margin-bottom: 28px;
}

.detail-layout__section:last-child {
  margin-bottom: 0;
}

.detail-layout__section-title {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-color-gray-700);
  margin-bottom: var(--of-spacing-3);
}

/* 描述内容 */
.detail-layout__description {
  min-height: 48px;
}

.detail-layout__state {
  display: flex;
  align-items: flex-start;
  gap: var(--of-spacing-3);
  min-height: 220px;
  padding: var(--of-spacing-4) 0;
}

.detail-layout__state-icon {
  color: var(--of-text-secondary, var(--of-color-gray-500));
  flex-shrink: 0;
}

.detail-layout__state-copy {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1_5);
}

.detail-layout__state-title {
  font-size: var(--of-font-size-md);
  font-weight: var(--of-font-weight-semibold);
  color: var(--of-text-primary, var(--of-color-gray-900));
}

.detail-layout__state-description {
  margin: 0;
  font-size: var(--of-font-size-base);
  line-height: var(--of-line-height-relaxed);
  color: var(--of-text-secondary, var(--of-color-gray-500));
}

.detail-layout__desc-placeholder {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-md);
  color: var(--of-color-gray-500);
  line-height: var(--of-line-height-relaxed);
  margin: 0;
}

/* 评论列表 */
.detail-layout__comment-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-layout__empty-hint {
  font-family: var(--of-font-sans);
  font-size: var(--of-font-size-sm);
  color: var(--of-color-gray-400);
  margin: 0;
}

.detail-layout__footer {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-2);
  flex-wrap: wrap;
  margin-top: 28px;
}

/* ─── 右栏：属性面板 ─── */
.detail-layout__sidebar {
  width: 320px;
  flex-shrink: 0;
  padding: var(--of-spacing-5);
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
    padding: var(--of-spacing-5) var(--of-spacing-4);
  }

  .detail-layout__sidebar {
    width: 100%;
    border: none;
    border-top: 1px solid var(--of-color-gray-200);
    padding: var(--of-spacing-4);
  }

  .detail-layout__footer {
    margin-top: var(--of-spacing-5);
  }
}
</style>
