<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createVirtualListState, useVirtualList } from "@/composables/useVirtualList";
import { measureTextBlock } from "@/composables/useTextLayout";
import AiMessageBubble from "./AiMessageBubble.vue";
import UserMessageBubble from "./UserMessageBubble.vue";
import AiThinking from "./AiThinking.vue";

export interface AiMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  isStreaming?: boolean;
  /** 是否为错误消息，展示红色错误气泡 */
  isError?: boolean;
  timestamp?: string;
  avatar?: string;
  name?: string;
}

const props = defineProps<{
  messages: AiMessage[];
  isThinking?: boolean;
}>();

const AI_MESSAGE_LAYOUT = {
  font: "14px Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  lineHeightPx: 22.4,
  bubblePaddingX: 14,
  bubblePaddingY: 10,
  avatarAndGapPx: 44,
} as const;

const listRef = ref<HTMLElement | null>(null);
const listWidth = ref(0);
const virtualizationState = createVirtualListState();
let resizeObserver: ResizeObserver | null = null;

function syncListWidth(nextWidth?: number) {
  listWidth.value = Math.max(
    0,
    Math.round(nextWidth ?? listRef.value?.clientWidth ?? 0),
  );
}

function bindResizeObserver() {
  if (typeof ResizeObserver === "undefined" || !listRef.value) return;

  resizeObserver = new ResizeObserver((entries) => {
    // ResizeObserver drives the width used by the text-layout estimator.
    const nextWidth = entries[0]?.contentRect.width ?? listRef.value?.clientWidth ?? 0;
    syncListWidth(nextWidth);
  });
  resizeObserver.observe(listRef.value);
}

onMounted(() => {
  syncListWidth();
  bindResizeObserver();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

const estimateHeight = (index: number): number => {
  const msg = props.messages[index];
  if (!msg) return 80;

  const bubbleWidth = Math.max(0, listWidth.value - AI_MESSAGE_LAYOUT.avatarAndGapPx);
  if (bubbleWidth <= 0) return 80;

  return measureTextBlock({
    text: msg.content,
    font: AI_MESSAGE_LAYOUT.font,
    maxWidth: Math.max(0, bubbleWidth - AI_MESSAGE_LAYOUT.bubblePaddingX * 2),
    lineHeight: AI_MESSAGE_LAYOUT.lineHeightPx,
    whiteSpace: "pre-wrap",
    chromeHeight: AI_MESSAGE_LAYOUT.bubblePaddingY * 2,
    minHeight: AI_MESSAGE_LAYOUT.bubblePaddingY * 2 + AI_MESSAGE_LAYOUT.lineHeightPx,
  }).height;
};

const {
  visibleItems: visibleMessages,
  totalHeight,
  offsetY,
  scrollToBottom: virtualScrollToBottom,
} = useVirtualList({
  items: computed(() => props.messages),
  itemHeight: estimateHeight,
  overscan: 3,
  containerRef: listRef,
  state: virtualizationState,
  invalidateKey: listWidth,
});

function scrollToBottom() {
  virtualScrollToBottom();
}

watch(
  () => [props.messages.length, props.isThinking],
  async () => {
    await nextTick();
    scrollToBottom();
  },
  { immediate: true },
);
</script>

<template>
  <div ref="listRef" class="of-ai-message-list">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div class="of-ai-message-list-inner" :style="{ transform: `translateY(${offsetY}px)` }">
        <template v-for="{ data: msg } in visibleMessages" :key="msg.id">
          <AiMessageBubble
            v-if="msg.role === 'ai'"
            :content="msg.content"
            :is-streaming="msg.isStreaming"
            :is-error="msg.isError"
            :avatar="msg.avatar"
            :name="msg.name"
            :timestamp="msg.timestamp"
          />
          <UserMessageBubble
            v-else
            :content="msg.content"
            :avatar="msg.avatar"
            :timestamp="msg.timestamp"
          />
        </template>
      </div>
    </div>
    <AiThinking v-if="isThinking" />
  </div>
</template>

<style scoped>
.of-ai-message-list {
  display: flex;
  flex-direction: column;
  padding: var(--of-spacing-4);
  overflow-y: auto;
  flex: 1;
  box-sizing: border-box;
}

.of-ai-message-list-inner {
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-4);
}
</style>
