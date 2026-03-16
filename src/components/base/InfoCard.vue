<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";

defineOptions({ name: "InfoCard", inheritAttrs: false });

export interface InfoCardProps {
  variant?: "memo" | "notify" | "history";
  title: string;
  content?: string;
  contentLines?: number;
  borderColor?: string;
  // Memo specific
  tags?: string[];
  importance?: "normal" | "high";
  author?: string;
  date?: string;
  // Notify specific
  unread?: boolean;
  meta?: string;
  // History specific
  subtitle?: string;
  type?: string;
  typeColor?: string;
}

const props = withDefaults(defineProps<InfoCardProps>(), {
  variant: "memo",
  contentLines: 3,
  importance: "normal",
  unread: false,
});

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();

defineSlots<{
  actions?: () => VNode[];
  footer?: () => VNode[];
  icon?: () => VNode[];
}>();

// ── Border color resolution ──────────────────────────────────────────────────

const TYPE_COLOR_MAP: Record<string, string> = {
  模板: "var(--of-color-primary-500)",
  template: "var(--of-color-primary-500)",
  会话: "var(--of-color-success)",
  session: "var(--of-color-success)",
};

const resolvedBorderColor = computed<string>(() => {
  if (props.variant === "memo") {
    if (props.importance === "high") return "var(--of-color-error)";
    return props.borderColor ?? "var(--of-color-info)";
  }
  if (props.variant === "history") {
    if (props.typeColor) return props.typeColor;
    if (props.type && TYPE_COLOR_MAP[props.type]) return TYPE_COLOR_MAP[props.type];
    return props.borderColor ?? "var(--of-color-primary-500)";
  }
  return "transparent";
});

// ── Root card style ──────────────────────────────────────────────────────────

const cardStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = {
    "--of-ic-border": resolvedBorderColor.value,
  } as CSSProperties;
  if (props.variant === "notify") {
    (base as Record<string, string>)["--of-ic-unread-dot"] = props.unread
      ? "var(--of-color-info)"
      : "var(--of-color-text-tertiary)";
  }
  return base;
});

// ── Content clamp style ──────────────────────────────────────────────────────

const contentStyle = computed<CSSProperties>(
  () =>
    ({
      "--of-ic-clamp": String(props.contentLines ?? 3),
    }) as CSSProperties,
);

// ── Tag badge style ──────────────────────────────────────────────────────────

function tagStyle(index: number): CSSProperties {
  const PALETTES = [
    {
      bg: "var(--of-badge-blue-bg)",
      color: "var(--of-badge-blue-text)",
      border: "var(--of-badge-blue-border)",
    },
    {
      bg: "var(--of-badge-green-bg)",
      color: "var(--of-badge-green-text)",
      border: "var(--of-badge-green-border)",
    },
    {
      bg: "var(--of-badge-orange-bg)",
      color: "var(--of-badge-orange-text)",
      border: "var(--of-badge-orange-border)",
    },
    {
      bg: "var(--of-badge-purple-bg)",
      color: "var(--of-badge-purple-text)",
      border: "var(--of-badge-purple-border)",
    },
    {
      bg: "var(--of-badge-gray-bg)",
      color: "var(--of-badge-gray-text)",
      border: "var(--of-badge-gray-border)",
    },
  ];
  const t = PALETTES[index % PALETTES.length];
  return {
    "--of-ic-tag-bg": t.bg,
    "--of-ic-tag-color": t.color,
    "--of-ic-tag-border": t.border,
  } as CSSProperties;
}

function handleClick(e: MouseEvent) {
  emit("click", e);
}
</script>

<template>
  <div
    class="of-info-card"
    :class="`of-info-card--${variant}`"
    :style="cardStyle"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- ── MEMO variant ─────────────────────────────────────────────────── -->
    <template v-if="variant === 'memo'">
      <div class="of-info-card__icon-area" v-if="$slots.icon">
        <slot name="icon" />
      </div>
      <div class="of-info-card__body">
        <div class="of-info-card__title">{{ title }}</div>
        <div
          v-if="content"
          class="of-info-card__content of-info-card__content--clamp"
          :style="contentStyle"
        >
          {{ content }}
        </div>
        <div class="of-info-card__footer">
          <template v-if="tags && tags.length">
            <span
              v-for="(tag, i) in tags"
              :key="tag"
              class="of-info-card__tag"
              :style="tagStyle(i)"
              >{{ tag }}</span
            >
          </template>
          <span v-if="author" class="of-info-card__meta-text">{{ author }}</span>
          <span v-if="date" class="of-info-card__meta-text">{{ date }}</span>
          <slot name="footer" />
        </div>
      </div>
    </template>

    <!-- ── NOTIFY variant ─────────────────────────────────────────────── -->
    <template v-else-if="variant === 'notify'">
      <span class="of-info-card__dot" />
      <div class="of-info-card__body">
        <div class="of-info-card__title">{{ title }}</div>
        <div
          v-if="content"
          class="of-info-card__content of-info-card__content--clamp"
          :style="contentStyle"
        >
          {{ content }}
        </div>
        <div v-if="meta" class="of-info-card__notify-meta">{{ meta }}</div>
        <slot name="footer" />
      </div>
      <div v-if="$slots.actions" class="of-info-card__actions">
        <slot name="actions" />
      </div>
    </template>

    <!-- ── HISTORY variant ────────────────────────────────────────────── -->
    <template v-else-if="variant === 'history'">
      <div class="of-info-card__icon-area" v-if="$slots.icon">
        <slot name="icon" />
      </div>
      <div class="of-info-card__body">
        <div class="of-info-card__title">{{ title }}</div>
        <div v-if="subtitle" class="of-info-card__subtitle">{{ subtitle }}</div>
        <div
          v-if="content"
          class="of-info-card__content of-info-card__content--clamp"
          :style="contentStyle"
        >
          {{ content }}
        </div>
        <slot name="footer" />
      </div>
      <div v-if="$slots.actions" class="of-info-card__actions">
        <slot name="actions" />
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.of-info-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.of-info-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.of-info-card__title {
  font-size: 13px;
  line-height: 1.5;
  color: var(--of-color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-info-card__content {
  font-size: 12px;
  color: var(--of-color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
}

.of-info-card__content--clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--of-ic-clamp, 3);
  overflow: hidden;
}

.of-info-card__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.of-info-card__meta-text {
  font-size: 10px;
  color: var(--of-color-text-tertiary);
  line-height: 1.2;
}

.of-info-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  background: var(--of-ic-tag-bg);
  color: var(--of-ic-tag-color);
  border: 1px solid var(--of-ic-tag-border);
}

.of-info-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.of-info-card__icon-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Memo ─────────────────────────────────────────────────────────────────── */
.of-info-card--memo {
  padding: 12px;
  background: var(--of-color-bg-elevated);
  border-radius: 8px;
  border-left: 4px solid var(--of-ic-border, var(--of-color-info));
  box-shadow: var(--of-shadow-card);
}

.of-info-card--memo .of-info-card__title {
  font-weight: 600;
}

.of-info-card--memo:hover {
  box-shadow: var(--of-shadow-card-hover);
}

/* ── Notify ───────────────────────────────────────────────────────────────── */
.of-info-card--notify {
  padding: 10px 12px;
  border-bottom: 1px solid var(--of-color-border-light);
  border-radius: 0;
  background: v-bind("unread ? 'var(--of-color-warning-light)' : 'var(--of-color-bg-elevated)'");
}

.of-info-card--notify:hover {
  background: var(--of-color-bg-hover);
}

.of-info-card__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--of-ic-unread-dot, var(--of-color-text-tertiary));
  flex-shrink: 0;
  margin-top: 4px;
  transition: background 0.15s ease;
}

.of-info-card--notify .of-info-card__title {
  font-weight: 500;
}

.of-info-card--notify .of-info-card__content {
  color: var(--of-color-text-secondary);
}

.of-info-card__notify-meta {
  font-size: 10px;
  color: var(--of-color-text-tertiary);
  line-height: 1.4;
  margin-top: 2px;
}

/* ── History ──────────────────────────────────────────────────────────────── */
.of-info-card--history {
  padding: 11px 14px;
  background: var(--of-color-bg-elevated);
  border: 1px solid var(--of-color-border-light);
  border-radius: 10px;
  border-left: 3px solid var(--of-ic-border, var(--of-color-primary-500));
}

.of-info-card--history:hover {
  border-color: var(--of-ic-border, var(--of-color-primary-500));
}

.of-info-card--history .of-info-card__title {
  font-size: 13px;
  font-weight: 600;
}

.of-info-card__subtitle {
  font-size: 12px;
  color: var(--of-color-text-secondary);
  line-height: 1.5;
  word-break: break-word;
}
</style>
