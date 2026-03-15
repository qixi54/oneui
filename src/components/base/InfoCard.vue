<script setup lang="ts">
import { computed, type CSSProperties, type VNode } from "vue";

defineOptions({ name: "InfoCard" });

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
    (base as Record<string, string>)["--of-ic-unread-dot"] = props.unread ? "var(--of-color-info)" : "var(--of-color-text-tertiary)";
  }
  return base;
});

// ── Content clamp style ──────────────────────────────────────────────────────

const contentStyle = computed<CSSProperties>(() => ({
  "--of-ic-clamp": String(props.contentLines ?? 3),
} as CSSProperties));

// ── Tag badge style ──────────────────────────────────────────────────────────

function tagStyle(index: number): CSSProperties {
  const PALETTES = [
    { bg: "var(--of-badge-blue-bg)", color: "var(--of-badge-blue-text)", border: "var(--of-badge-blue-border)" },
    { bg: "var(--of-badge-green-bg)", color: "var(--of-badge-green-text)", border: "var(--of-badge-green-border)" },
    { bg: "var(--of-badge-orange-bg)", color: "var(--of-badge-orange-text)", border: "var(--of-badge-orange-border)" },
    { bg: "var(--of-badge-purple-bg)", color: "var(--of-badge-purple-text)", border: "var(--of-badge-purple-border)" },
    { bg: "var(--of-badge-gray-bg)", color: "var(--of-badge-gray-text)", border: "var(--of-badge-gray-border)" },
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
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  width: 100% !important;
  box-sizing: border-box !important;
  cursor: pointer !important;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease !important;
}

.of-info-card__body {
  flex: 1 !important;
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.of-info-card__title {
  font-size: 13px !important;
  line-height: 1.5 !important;
  color: var(--of-color-text-primary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.of-info-card__content {
  font-size: 12px !important;
  color: var(--of-color-text-secondary) !important;
  line-height: 1.6 !important;
  word-break: break-word !important;
}

.of-info-card__content--clamp {
  display: -webkit-box !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: var(--of-ic-clamp, 3) !important;
  overflow: hidden !important;
}

.of-info-card__footer {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
  margin-top: 2px !important;
}

.of-info-card__meta-text {
  font-size: 10px !important;
  color: var(--of-color-text-tertiary) !important;
  line-height: 1.2 !important;
}

.of-info-card__tag {
  display: inline-flex !important;
  align-items: center !important;
  padding: 1px 6px !important;
  border-radius: 3px !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  background: var(--of-ic-tag-bg) !important;
  color: var(--of-ic-tag-color) !important;
  border: 1px solid var(--of-ic-tag-border) !important;
}

.of-info-card__actions {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
}

.of-info-card__icon-area {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

/* ── Memo ─────────────────────────────────────────────────────────────────── */
.of-info-card--memo {
  padding: 12px !important;
  background: var(--of-color-bg-primary, #fff) !important;
  border-radius: 8px !important;
  border-left: 4px solid var(--of-ic-border, var(--of-color-info)) !important;
  box-shadow: var(--of-shadow-card) !important;
}

.of-info-card--memo .of-info-card__title {
  font-weight: 600 !important;
}

.of-info-card--memo:hover {
  box-shadow: var(--of-shadow-card-hover) !important;
}

/* ── Notify ───────────────────────────────────────────────────────────────── */
.of-info-card--notify {
  padding: 10px 12px !important;
  border-bottom: 1px solid var(--of-color-border-light) !important;
  border-radius: 0 !important;
  background: v-bind("unread ? 'var(--of-color-warning-light, #fffbe6)' : 'var(--of-color-bg-primary, #fff)'") !important;
}

.of-info-card--notify:hover {
  background: var(--of-color-bg-secondary, #fafafa) !important;
}

.of-info-card__dot {
  display: inline-block !important;
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: var(--of-ic-unread-dot, var(--of-color-text-tertiary)) !important;
  flex-shrink: 0 !important;
  margin-top: 4px !important;
  transition: background 0.15s ease !important;
}

.of-info-card--notify .of-info-card__title {
  font-weight: 500 !important;
}

.of-info-card--notify .of-info-card__content {
  color: var(--of-color-text-secondary) !important;
}

.of-info-card__notify-meta {
  font-size: 10px !important;
  color: var(--of-color-text-tertiary) !important;
  line-height: 1.4 !important;
  margin-top: 2px !important;
}

/* ── History ──────────────────────────────────────────────────────────────── */
.of-info-card--history {
  padding: 11px 14px !important;
  background: var(--of-color-bg-primary, #fff) !important;
  border: 1px solid var(--of-color-border-light) !important;
  border-radius: 10px !important;
  border-left: 3px solid var(--of-ic-border, var(--of-color-primary-500)) !important;
}

.of-info-card--history:hover {
  border-color: var(--of-ic-border, var(--of-color-primary-500)) !important;
}

.of-info-card--history .of-info-card__title {
  font-size: 13px !important;
  font-weight: 600 !important;
}

.of-info-card__subtitle {
  font-size: 12px !important;
  color: var(--of-color-text-secondary) !important;
  line-height: 1.5 !important;
  word-break: break-word !important;
}
</style>
