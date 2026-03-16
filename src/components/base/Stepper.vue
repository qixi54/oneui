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
  "step-content"?: (props: { item: StepItem; index: number; status: StepStatus }) => unknown;
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
  <div :class="['of-stepper', isHorizontal ? 'of-stepper--horizontal' : 'of-stepper--vertical']">
    <template v-for="(item, index) in steps" :key="`${item.label}-${index}`">
      <div
        :class="[
          'of-stepper__step',
          `of-stepper__step--${getStepStatus(index)}`,
          isHorizontal ? 'of-stepper__step--horizontal' : 'of-stepper__step--vertical',
        ]"
      >
        <div
          :class="['of-stepper__indicator', `of-stepper__indicator--${getStepStatus(index)}`]"
          :aria-current="getStepStatus(index) === 'active' ? 'step' : undefined"
        >
          <Check v-if="getStepStatus(index) === 'done'" :size="14" :stroke-width="3" />
          <span v-else>{{ index + 1 }}</span>
        </div>

        <div class="of-stepper__content">
          <slot name="step-content" :item="item" :index="index" :status="getStepStatus(index)">
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
  display: flex;
}

.of-stepper--horizontal {
  flex-direction: row;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}

.of-stepper--vertical {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.of-stepper__step {
  display: flex;
  gap: 12px;
}

.of-stepper__step--horizontal {
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 120px;
  flex-shrink: 0;
  text-align: center;
}

.of-stepper__step--vertical {
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
}

.of-stepper__indicator {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  box-sizing: border-box;
}

.of-stepper__indicator--done {
  background: var(--of-color-success);
  color: var(--of-color-bg-elevated, #ffffff);
  border: 2px solid var(--of-color-success);
}

.of-stepper__indicator--active {
  background: var(--of-color-bg-elevated, #ffffff);
  color: var(--of-color-info);
  border: 2px solid var(--of-color-info);
}

.of-stepper__indicator--pending {
  background: var(--of-color-gray-300);
  color: var(--of-color-text-secondary);
  border: 2px solid var(--of-color-gray-300);
}

.of-stepper__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.of-stepper__label {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--of-color-text);
}

.of-stepper__description {
  margin: 0;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--of-color-text-secondary);
}

.of-stepper__line {
  flex-shrink: 0;
  border-radius: 999px;
}

.of-stepper__line--horizontal {
  width: 48px;
  height: 2px;
  margin: 15px 12px 0;
}

.of-stepper__line--vertical {
  width: 2px;
  height: 24px;
  margin: 8px 0 8px 15px;
}

.of-stepper__line--done {
  background: var(--of-color-success);
}

.of-stepper__line--pending {
  background: var(--of-color-gray-200);
}
</style>
