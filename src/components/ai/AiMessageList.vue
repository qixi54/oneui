<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
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

function scrollToBottom() {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
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
    <template v-for="msg in messages" :key="msg.id">
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
    <AiThinking v-if="isThinking" />
  </div>
</template>

<style scoped>
.of-ai-message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  box-sizing: border-box;
}
</style>
