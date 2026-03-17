import { ref, nextTick, onBeforeUnmount } from "vue";

/**
 * Focus trap composable — 管理 dialog/drawer/panel 的焦点陷阱
 *
 * 返回 containerRef（绑到容器元素），activate() 打开时调用，deactivate() 关闭时调用。
 */
export function useFocusTrap() {
  const containerRef = ref<HTMLElement | null>(null);
  let previousFocus: HTMLElement | null = null;

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return [];
    return Array.from(
      containerRef.value.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]',
      ),
    ).filter((el) => !el.closest('[aria-hidden="true"]'));
  }

  function trapFocus(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function activate() {
    previousFocus = document.activeElement as HTMLElement;
    nextTick(() => {
      const focusable = getFocusableElements();
      if (focusable.length) focusable[0].focus();
      document.addEventListener("keydown", trapFocus);
    });
  }

  function deactivate() {
    document.removeEventListener("keydown", trapFocus);
    previousFocus?.focus();
    previousFocus = null;
  }

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", trapFocus);
  });

  return { containerRef, activate, deactivate };
}
