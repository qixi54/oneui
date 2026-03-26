<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";

export interface InfoCardProps {
  variant?: "memo" | "notify" | "history";
  title: string;
  content?: string;
  contentLines?: number;
  borderColor?: string;
  disabled?: boolean;
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
  content: undefined,
  borderColor: undefined,
  tags: undefined,
  author: undefined,
  date: undefined,
  meta: undefined,
  subtitle: undefined,
  type: undefined,
  typeColor: undefined,
  variant: "memo",
  contentLines: 3,
  importance: "normal",
  unread: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();
defineOptions({ name: "InfoCard", inheritAttrs: false });

defineSlots<{
  actions?: () => VNode[];
  footer?: () => VNode[];
  icon?: () => VNode[];
}>();

// ── Border color resolution ──────────────────────────────────────────────────

const TYPE_COLOR_MAP: Record<string, string> = {
  模板: "var(--of-accent-default)",
  template: "var(--of-accent-default)",
  会话: "var(--of-text-strong)",
  session: "var(--of-text-strong)",
};

const resolvedBorderColor = computed<string>(() => {
  if (props.variant === "memo") {
    if (props.importance === "high") return "var(--of-border-strong)";
    return props.borderColor ?? "var(--of-accent-default)";
  }
  if (props.variant === "history") {
    if (props.typeColor) return props.typeColor;
    if (props.type && TYPE_COLOR_MAP[props.type]) return TYPE_COLOR_MAP[props.type];
    return props.borderColor ?? "var(--of-accent-default)";
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
      ? "var(--of-accent-default)"
      : "var(--of-text-tertiary)";
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
      bg: "var(--of-surface-muted)",
      color: "var(--of-accent-default)",
      border: "var(--of-border-workspace)",
    },
    {
      bg: "var(--of-surface-panel)",
      color: "var(--of-text-strong)",
      border: "var(--of-border-workspace)",
    },
    {
      bg: "var(--of-surface-selected)",
      color: "var(--of-accent-strong)",
      border: "var(--of-border-strong)",
    },
    {
      bg: "var(--of-surface-panel)",
      color: "var(--of-text-secondary)",
      border: "var(--of-border-workspace)",
    },
    {
      bg: "var(--of-surface-muted)",
      color: "var(--of-text-tertiary)",
      border: "var(--of-border-workspace)",
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
  if (props.disabled) return;
  emit("click", e);
}

function handleKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  handleClick(new MouseEvent("click"));
}
</script>

<template>
  <div
    class="of-info-card"
    :class="[`of-info-card--${variant}`, { 'of-info-card--disabled': disabled }]"
    :style="cardStyle"
    role="button"
    tabindex="0"
    :aria-disabled="disabled || undefined"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- ── MEMO variant ─────────────────────────────────────────────────── -->
    <template v-if="variant === 'memo'">
      <div v-if="$slots.icon" class="of-info-card__icon-area">
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
            >{{ tag }}</span>
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
      <div v-if="$slots.icon" class="of-info-card__icon-area">
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
  gap: var(--of-spacing-2_5);
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.of-info-card:hover {
  box-shadow: var(--of-elevation-card-hover);
  border-color: var(--of-border-strong);
}

.of-info-card:focus-visible {
  outline: 2px solid var(--of-accent-default);
  outline-offset: 2px;
}

.of-info-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.of-info-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--of-spacing-1);
}

.of-info-card__title {
  font-size: var(--of-font-size-base);
  line-height: var(--of-line-height-normal);
  color: var(--of-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.of-info-card__content {
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary);
  line-height: var(--of-line-height-relaxed);
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
  gap: var(--of-spacing-1_5);
  margin-top: var(--of-spacing-0_5);
}

.of-info-card__meta-text {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary);
  line-height: var(--of-line-height-tight);
}

.of-info-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--of-spacing-1_5);
  border-radius: var(--of-radius-sm);
  font-size: var(--of-font-size-xs);
  font-weight: var(--of-font-weight-medium);
  line-height: 1.4;
  white-space: nowrap;
  background: var(--of-ic-tag-bg);
  color: var(--of-ic-tag-color);
  border: 1px solid var(--of-ic-tag-border);
}

.of-info-card__actions {
  display: flex;
  align-items: center;
  gap: var(--of-spacing-1);
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
  padding: var(--of-spacing-3);
  background: var(--of-surface-card);
  border-radius: var(--of-radius-lg);
  border-left: 4px solid var(--of-ic-border, var(--of-accent-default));
  box-shadow: var(--of-elevation-card);
}

.of-info-card--memo .of-info-card__title {
  font-weight: var(--of-font-weight-semibold);
}

.of-info-card--memo:hover {
  box-shadow: var(--of-elevation-card-hover);
}

/* ── Notify ───────────────────────────────────────────────────────────────── */
.of-info-card--notify {
  padding: var(--of-spacing-2_5) var(--of-spacing-3);
  border-bottom: 1px solid var(--of-border-workspace);
  border-radius: 0;
  background: v-bind("unread ? 'var(--of-surface-selected)' : 'var(--of-surface-card)'");
}

.of-info-card--notify:hover {
  background: var(--of-surface-selected);
}

.of-info-card__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--of-ic-unread-dot, var(--of-text-tertiary));
  flex-shrink: 0;
  margin-top: var(--of-spacing-1);
  transition: background 0.15s ease;
}

.of-info-card--notify .of-info-card__title {
  font-weight: var(--of-font-weight-medium);
}

.of-info-card--notify .of-info-card__content {
  color: var(--of-text-secondary);
}

.of-info-card__notify-meta {
  font-size: var(--of-font-size-xs);
  color: var(--of-text-tertiary);
  line-height: 1.4;
  margin-top: var(--of-spacing-0_5);
}

/* ── History ──────────────────────────────────────────────────────────────── */
.of-info-card--history {
  padding: 11px var(--of-spacing-3_5);
  background: var(--of-surface-card);
  border: 1px solid var(--of-border-workspace);
  border-radius: var(--of-radius-xl);
  border-left: 3px solid var(--of-ic-border, var(--of-accent-default));
  box-shadow: var(--of-elevation-card);
}

.of-info-card--history:hover {
  border-color: var(--of-ic-border, var(--of-accent-default));
}

.of-info-card--history .of-info-card__title {
  font-size: var(--of-font-size-base);
  font-weight: var(--of-font-weight-semibold);
}

.of-info-card__subtitle {
  font-size: var(--of-font-size-sm);
  color: var(--of-text-secondary);
  line-height: var(--of-line-height-normal);
  word-break: break-word;
}
</style>
