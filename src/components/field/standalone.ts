import { computed } from "vue";
import type { CellValue, FieldDef, FieldOption } from "@/components/table/FieldCell.vue";

export interface StandaloneFieldProps {
  value?: CellValue;
  field?: FieldDef;
  modelValue?: CellValue;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface StandaloneOptionsFieldProps extends StandaloneFieldProps {
  options?: FieldOption[];
}

export function useStandaloneField(props: StandaloneFieldProps) {
  const isStandalone = computed(() => !props.field);
  const currentValue = computed<CellValue>(() =>
    isStandalone.value ? props.modelValue : props.value,
  );
  const resolvedLabel = computed(() => props.field?.label ?? props.label ?? "字段");
  const resolvedPlaceholder = computed(() => props.placeholder ?? "");
  const resolvedDisabled = computed(() => Boolean(props.disabled ?? props.field?.readonly));

  return {
    isStandalone,
    currentValue,
    resolvedLabel,
    resolvedPlaceholder,
    resolvedDisabled,
  };
}

export function useStandaloneOptions(props: StandaloneOptionsFieldProps) {
  return computed(() => props.field?.options ?? props.options ?? []);
}
