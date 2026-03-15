<script setup lang="ts">
import { computed } from "vue";
import { Check } from "lucide-vue-next";

export interface StepItem {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  current: number;
  direction?: "horizontal" | "vertical";
}

export type StepStatus = "done" | "active" | "pending";

const props = withDefaults(defineProps<StepperProps>(), {
  direction: "horizontal",
});

defineSlots<{
  "step-content"?: (props: {
    item: StepItem;
    index: number;
    status: StepStatus;
  }) => unknown;
}>();

const isHorizontal = computed(() => props.direction === "horizontal");

function getStepStatus(index: number): StepStatus {
  if (index < props.current) {
    return "done";
  }

  if (index === props.current) {
    return "active";
  }

  return "pending";
}

function getLineStatus(index: number): "done" | "pending" {
  return index < props.current ? "done" : "pending";
}
</script>

<template>
  <div
    :class="[
      'of-stepper',
      isHorizontal ? 'of-stepper--horizontal' : 'of-stepper--vertical',
    ]"
  >
    <template v-for="(item, index) in steps" :key="`${item.label}-${index}`">
      <div
        :class="[
          'of-stepper__step',
          `of-stepper__step--${getStepStatus(index)}`,
          isHorizontal ? 'of-stepper__step--horizontal' : 'of-stepper__step--vertical',
        ]"
      >
        <div
          :class="[
            'of-stepper__indicator',
            `of-stepper__indicator--${getStepStatus(index)}`,
          ]"
          :aria-current="getStepStatus(index) === 'active' ? 'step' : undefined"
        >
          <Check v-if="getStepStatus(index) === 'done'" :size="14" :stroke-width="3" />
          <span v-else>{{ index + 1 }}</span>
        </div>

        <div class="of-stepper__content">
          <slot
            name="step-content"
            :item="item"
            :index="index"
            :status="getStepStatus(index)"
          >
            <p class="of-stepper__label">{{ item.label }}</p>
            <p v-if="item.description" class="of-stepper__description">
              {{ item.description }}
            </p>
          </slot>
        </div>
      </div>

      <div
        v-if="index < steps.length - 1"
        :class="[
          'of-stepper__line',
          `of-stepper__line--${getLineStatus(index)}`,
          isHorizontal ? 'of-stepper__line--horizontal' : 'of-stepper__line--vertical',
        ]"
      />
    </template>
  </div>
</template>

<style scoped>
.of-stepper {
  display: flex !important;
}

.of-stepper--horizontal {
  flex-direction: row !important;
  align-items: flex-start !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  width: 100% !important;
}

.of-stepper--vertical {
  flex-direction: column !important;
  align-items: stretch !important;
  width: 100% !important;
}

.of-stepper__step {
  display: flex !important;
  gap: 12px !important;
}

.of-stepper__step--horizontal {
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: 120px !important;
  flex-shrink: 0 !important;
  text-align: center !important;
}

.of-stepper__step--vertical {
  flex-direction: row !important;
  align-items: flex-start !important;
  width: 100% !important;
}

.of-stepper__indicator {
  width: 32px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 999px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
}

.of-stepper__indicator--done {
  background: var(--of-color-success) !important;
  color: var(--of-color-bg-elevated, #ffffff) !important;
  border: 2px solid var(--of-color-success) !important;
}

.of-stepper__indicator--active {
  background: var(--of-color-bg-elevated, #ffffff) !important;
  color: var(--of-color-info) !important;
  border: 2px solid var(--of-color-info) !important;
}

.of-stepper__indicator--pending {
  background: var(--of-color-gray-300) !important;
  color: var(--of-color-text-secondary) !important;
  border: 2px solid var(--of-color-gray-300) !important;
}

.of-stepper__content {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  min-width: 0 !important;
}

.of-stepper__label {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  color: var(--of-color-text) !important;
}

.of-stepper__description {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  color: var(--of-color-text-secondary) !important;
}

.of-stepper__line {
  flex-shrink: 0 !important;
  border-radius: 999px !important;
}

.of-stepper__line--horizontal {
  width: 48px !important;
  height: 2px !important;
  margin: 15px 12px 0 !important;
}

.of-stepper__line--vertical {
  width: 2px !important;
  height: 24px !important;
  margin: 8px 0 8px 15px !important;
}

.of-stepper__line--done {
  background: var(--of-color-success) !important;
}

.of-stepper__line--pending {
  background: var(--of-color-gray-200) !important;
}
</style>
