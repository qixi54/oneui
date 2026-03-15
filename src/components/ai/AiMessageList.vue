<script setup lang="ts">
import { ref, watch, nextTick, computed } from "vue";
import { useVirtualList } from "@/composables/useVirtualList";
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

const listRef = ref<HTMLElement | null>(null);

const estimateHeight = (index: number): number => {
  const msg = props.messages[index];
  if (!msg) return 80;
  if (msg.role === "user") return 60;

  const contentLines = Math.ceil((msg.content?.length ?? 0) / 60);
  return Math.max(80, 48 + contentLines * 24);
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
      <div
        class="of-ai-message-list-inner"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
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
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  box-sizing: border-box;
}

.of-ai-message-list-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
