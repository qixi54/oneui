import { computed, nextTick, onMounted, type Ref } from "vue";
import type {
  TableColumnFieldContract,
  TableColumnFieldOption,
} from "../types/data-table";

export type CellValue = string | number | boolean | string[] | null | undefined;
export type FieldDef = TableColumnFieldContract;
export type FieldOption = TableColumnFieldOption;

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

export interface UseFieldBaseOptions {
  props: StandaloneFieldProps;
  focusRef?: Ref<HTMLElement | null>;
  autoFocus?: boolean;
}

export function useFieldBase(options: UseFieldBaseOptions) {
  const { props, focusRef, autoFocus = true } = options;

  const isStandalone = computed(() => !props.field);
  const currentValue = computed<CellValue>(() =>
    isStandalone.value ? props.modelValue : props.value,
  );
  const resolvedLabel = computed(() => props.field?.label ?? props.label ?? "字段");
  const resolvedPlaceholder = computed(() => props.placeholder ?? "");
  const resolvedDisabled = computed(() => Boolean(props.disabled ?? props.field?.readonly));

  if (autoFocus && focusRef) {
    onMounted(() => {
      if (!isStandalone.value && !resolvedDisabled.value) {
        nextTick(() => focusRef.value?.focus());
      }
    });
  }

  return {
    isStandalone,
    currentValue,
    resolvedLabel,
    resolvedPlaceholder,
    resolvedDisabled,
  };
}

export function useFieldOptions(props: StandaloneOptionsFieldProps) {
  return computed(() => props.field?.options ?? props.options ?? []);
}
