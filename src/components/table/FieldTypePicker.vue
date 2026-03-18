<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Type,
  Hash,
  ListChecks,
  Calendar,
  CalendarClock,
  CheckSquare,
  Link,
  Mail,
  Phone,
  Star,
  User,
  Paperclip,
  GitBranch,
  FunctionSquare,
  DollarSign,
  FileText,
  ListOrdered,
  UserCheck,
  BarChart3,
} from "lucide-vue-next";
import type { FieldType } from "../../types";

withDefaults(
  defineProps<{
    /** 当前选中的类型（高亮） */
    currentType?: FieldType;
    /** 搜索过滤 */
    searchable?: boolean;
  }>(),
  {
    searchable: true,
  },
);

const emit = defineEmits<{
  select: [type: FieldType];
}>();

const searchQuery = ref("");

interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: any;
  category: string;
}

const FIELD_TYPES: FieldTypeOption[] = [
  // 基础
  { type: "text", label: "文本", icon: Type, category: "基础" },
  { type: "number", label: "数字", icon: Hash, category: "基础" },
  { type: "checkbox", label: "复选框", icon: CheckSquare, category: "基础" },
  { type: "select", label: "单选", icon: ListChecks, category: "基础" },
  { type: "multi_select", label: "多选", icon: ListChecks, category: "基础" },
  // 日期
  { type: "date", label: "日期", icon: Calendar, category: "日期" },
  { type: "datetime", label: "日期时间", icon: CalendarClock, category: "日期" },
  // 联系方式
  { type: "url", label: "链接", icon: Link, category: "联系" },
  { type: "email", label: "邮箱", icon: Mail, category: "联系" },
  { type: "phone", label: "电话", icon: Phone, category: "联系" },
  // 高级
  { type: "rating", label: "评分", icon: Star, category: "高级" },
  { type: "currency", label: "货币", icon: DollarSign, category: "高级" },
  { type: "progress", label: "进度", icon: BarChart3, category: "高级" },
  { type: "richtext", label: "富文本", icon: FileText, category: "高级" },
  // 系统
  { type: "user", label: "用户", icon: User, category: "系统" },
  { type: "creator", label: "创建者", icon: UserCheck, category: "系统" },
  { type: "auto_number", label: "自动编号", icon: ListOrdered, category: "系统" },
  // 关联
  { type: "relation", label: "关联", icon: GitBranch, category: "关联" },
  { type: "attachment", label: "附件", icon: Paperclip, category: "关联" },
  { type: "formula", label: "公式", icon: FunctionSquare, category: "关联" },
];

const filteredTypes = computed(() => {
  if (!searchQuery.value) return FIELD_TYPES;
  const q = searchQuery.value.toLowerCase();
  return FIELD_TYPES.filter(
    (t) => t.label.includes(q) || t.type.includes(q) || t.category.includes(q),
  );
});

// 按 category 分组
const groupedTypes = computed(() => {
  const groups: { category: string; items: FieldTypeOption[] }[] = [];
  const categoryMap = new Map<string, FieldTypeOption[]>();

  for (const t of filteredTypes.value) {
    if (!categoryMap.has(t.category)) {
      categoryMap.set(t.category, []);
    }
    categoryMap.get(t.category)!.push(t);
  }

  for (const [category, items] of categoryMap) {
    groups.push({ category, items });
  }
  return groups;
});

function handleSelect(type: FieldType) {
  emit("select", type);
}
</script>

<template>
  <div class="of-field-type-picker">
    <!-- 搜索框 -->
    <div v-if="searchable" class="of-field-type-picker__search">
      <input
        v-model="searchQuery"
        class="of-field-type-picker__search-input"
        placeholder="搜索字段类型..."
      />
    </div>

    <!-- 类型列表 -->
    <div class="of-field-type-picker__list">
      <div v-for="group in groupedTypes" :key="group.category" class="of-field-type-picker__group">
        <div class="of-field-type-picker__group-label">{{ group.category }}</div>
        <button
          v-for="ft in group.items"
          :key="ft.type"
          class="of-field-type-picker__item"
          :class="{ 'of-field-type-picker__item--active': currentType === ft.type }"
          @click="handleSelect(ft.type)"
        >
          <component :is="ft.icon" :size="14" class="of-field-type-picker__icon" />
          <span>{{ ft.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.of-field-type-picker {
  width: 220px;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  background: var(--of-color-bg-elevated, #fff);
  border: 1px solid var(--of-border, #e2e8f0);
  border-radius: 8px;
  box-shadow: var(--of-shadow-popover);
  overflow: hidden;
}

.of-field-type-picker__search {
  padding: 8px;
  border-bottom: 1px solid var(--of-border, #e2e8f0);
  flex-shrink: 0;
}

.of-field-type-picker__search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--of-border, #e2e8f0);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: var(--of-color-gray-50);
  color: var(--of-color-text);
  box-sizing: border-box;
}

.of-field-type-picker__search-input:focus {
  border-color: var(--of-color-primary-500);
}

.of-field-type-picker__search-input::placeholder {
  color: var(--of-color-text-tertiary);
}

.of-field-type-picker__list {
  overflow-y: auto;
  padding: 4px 0;
}

.of-field-type-picker__group {
  padding: 0 4px;
}

.of-field-type-picker__group-label {
  font-size: 11px;
  color: var(--of-color-text-tertiary);
  padding: 6px 8px 2px;
  font-weight: 500;
  user-select: none;
}

.of-field-type-picker__item {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--of-color-text);
  text-align: left;
  transition: background 0.15s;
}

.of-field-type-picker__item:hover {
  background: var(--of-color-bg-hover);
}

.of-field-type-picker__item--active {
  background: var(--of-color-primary-50);
  color: var(--of-color-primary-500);
}

.of-field-type-picker__item--active:hover {
  background: var(--of-color-primary-50);
}

.of-field-type-picker__icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.of-field-type-picker__item--active .of-field-type-picker__icon {
  opacity: 1;
}
</style>
