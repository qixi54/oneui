import { onUnmounted, watch, type Ref } from "vue";
import { useFocusTrap } from "./useFocusTrap";

export interface UseOverlayOptions {
  open: Ref<boolean> | (() => boolean);
  onClose: () => void;
  escapeClose?: boolean;
  lockScroll?: boolean;
  trapFocus?: boolean;
}

export function useOverlay(options: UseOverlayOptions) {
  const { onClose, escapeClose = true, lockScroll = true, trapFocus = true } = options;
  const openSource = options.open;
  const {
    containerRef,
    activate: activateTrap,
    deactivate: deactivateTrap,
  } = useFocusTrap();

  const openGetter = typeof openSource === "function" ? openSource : () => openSource.value;

  function onKeydown(e: KeyboardEvent) {
    if (escapeClose && e.key === "Escape") {
      onClose();
    }
  }

  watch(
    openGetter,
    (isOpen) => {
      if (typeof document === "undefined") return;
      if (lockScroll) {
        document.body.style.overflow = isOpen ? "hidden" : "";
      }
      if (isOpen) {
        document.addEventListener("keydown", onKeydown);
        if (trapFocus) {
          activateTrap();
        }
      } else {
        document.removeEventListener("keydown", onKeydown);
        if (trapFocus) {
          deactivateTrap();
        }
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (typeof document === "undefined") return;
    if (lockScroll) {
      document.body.style.overflow = "";
    }
    document.removeEventListener("keydown", onKeydown);
    if (trapFocus) {
      deactivateTrap();
    }
  });

  return {
    containerRef,
    onKeydown,
  };
}
