import { ref, computed, watch, readonly } from "vue";

export interface UseSearchOptions {
  /** 防抖延迟（ms），默认 300 */
  debounceMs?: number;
  /** 最小搜索字符数，默认 1 */
  minChars?: number;
  /** 搜索模式 */
  mode?: "client" | "server";
}

export interface SearchHighlight {
  /** 原始文本 */
  text: string;
  /** 是否为匹配片段 */
  match: boolean;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, minChars = 1 } = options;

  /** 用户输入的原始关键词 */
  const inputKeyword = ref("");
  /** 防抖后的实际搜索词（用于查询） */
  const keyword = ref("");
  /** 是否正在搜索 */
  const isSearching = computed(() => keyword.value.length >= minChars);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 防抖 watch
  watch(inputKeyword, (val) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const trimmed = val.trim();
    if (trimmed.length < minChars) {
      keyword.value = "";
      return;
    }

    debounceTimer = setTimeout(() => {
      keyword.value = trimmed;
    }, debounceMs);
  });

  /**
   * 高亮文本中的匹配部分
   * 返回分段数组，每段标记是否匹配
   */
  function highlightText(text: string, query?: string): SearchHighlight[] {
    const searchTerm = query ?? keyword.value;
    if (!searchTerm || !text) {
      return [{ text, match: false }];
    }

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    return parts.filter(Boolean).map((part) => ({
      text: part,
      match: part.toLowerCase() === searchTerm.toLowerCase(),
    }));
  }

  /**
   * 客户端模式：过滤数据行
   * 在指定列中搜索关键词
   */
  function filterBySearch<T extends Record<string, unknown>>(
    data: T[],
    searchColumns: string[],
  ): T[] {
    if (!keyword.value || !searchColumns.length) return data;

    const lowerKeyword = keyword.value.toLowerCase();
    return data.filter((row) => {
      return searchColumns.some((col) => {
        const val = row[col];
        if (val == null) return false;
        return String(val).toLowerCase().includes(lowerKeyword);
      });
    });
  }

  /** 清空搜索 */
  function clearSearch() {
    inputKeyword.value = "";
    keyword.value = "";
    if (debounceTimer) clearTimeout(debounceTimer);
  }

  /** 直接设置搜索词（跳过防抖） */
  function setKeyword(val: string) {
    inputKeyword.value = val;
    keyword.value = val.trim();
    if (debounceTimer) clearTimeout(debounceTimer);
  }

  return {
    /** 绑定到 input 的 v-model */
    inputKeyword,
    /** 防抖后的搜索词（传给 useSupabaseProvider 的 searchKeyword） */
    keyword: readonly(keyword),
    /** 是否有有效搜索词 */
    isSearching,
    /** 高亮文本分段 */
    highlightText,
    /** 客户端过滤 */
    filterBySearch,
    /** 清空 */
    clearSearch,
    /** 直接设置 */
    setKeyword,
  };
}
