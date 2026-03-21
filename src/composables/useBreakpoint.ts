import { ref, computed, onMounted, onUnmounted } from "vue";

export function useBreakpoint() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const hasTouch = ref(typeof window !== "undefined" && "ontouchstart" in window);

  function update() {
    const w = window.innerWidth;
    isMobile.value = w < 768;
    isTablet.value = w >= 768 && w < 1024;
  }

  onMounted(() => {
    update();
    window.addEventListener("resize", update, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  const isDesktop = computed(() => !isMobile.value && !isTablet.value);

  return { isMobile, isTablet, isDesktop, hasTouch };
}
