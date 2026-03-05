<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Plus } from "lucide-vue-next";

const { placeholder = "快速创建任务，按 Enter 提交" } = defineProps<{
  placeholder?: string;
}>();

const emit = defineEmits<{
  submit: [title: string];
  cancel: [];
}>();

const expanded = ref(false);
const inputValue = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

async function expand() {
  expanded.value = true;
  await nextTick();
  inputRef.value?.focus();
}

function collapse() {
  expanded.value = false;
  inputValue.value = "";
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    const val = inputValue.value.trim();
    if (val) {
      emit("submit", val);
      inputValue.value = "";
      collapse();
    }
  } else if (e.key === "Escape") {
    emit("cancel");
    collapse();
  }
}

function handleBlur() {
  // 短延迟，避免 click 事件竞争
  setTimeout(() => {
    if (!inputValue.value.trim()) {
      collapse();
    }
  }, 150);
}
</script>

<template>
  <div class="of-quick-add">
    <!-- 收起态：plus 图标 + placeholder -->
    <button v-if="!expanded" class="of-quick-add-trigger" @click="expand">
      <Plus :size="14" class="of-quick-add-icon" />
      <span class="of-quick-add-placeholder">{{ placeholder }}</span>
    </button>

    <!-- 展开态：input 输入框 -->
    <input
      v-else
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="of-quick-add-input"
      :placeholder="placeholder"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />
  </div>
</template>

<style scoped>
.of-quick-add {
  width: 100%;
}

.of-quick-add-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid var(--of-color-gray-200);
  border-radius: var(--of-radius-lg);
  cursor: pointer;
  transition: var(--of-transition-fast);
  box-sizing: border-box;
}

.of-quick-add-trigger:hover {
  border-color: var(--of-color-gray-300);
  background: var(--of-color-gray-50);
}

.of-quick-add-icon {
  color: var(--of-color-gray-400);
  flex-shrink: 0;
  transition: var(--of-transition-fast);
}

.of-quick-add-trigger:hover .of-quick-add-icon {
  color: var(--of-color-gray-600);
}

.of-quick-add-placeholder {
  font-size: 13px;
  color: var(--of-color-gray-400);
  transition: var(--of-transition-fast);
  text-align: left;
}

.of-quick-add-trigger:hover .of-quick-add-placeholder {
  color: var(--of-color-gray-600);
}

.of-quick-add-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid var(--of-color-primary-400);
  border-radius: var(--of-radius-lg);
  font-size: 13px;
  color: var(--of-color-gray-900);
  outline: none;
  box-shadow: 0 0 0 3px var(--of-color-primary-50);
  box-sizing: border-box;
  font-family: var(--of-font-sans);
  transition: var(--of-transition-fast);
}

.of-quick-add-input::placeholder {
  color: var(--of-color-gray-400);
}
</style>
