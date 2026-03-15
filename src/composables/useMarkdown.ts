import { marked } from "marked";

// 改为按需加载 highlight.js 核心
import hljs from "highlight.js/lib/core";

// 按需注册常用语言（覆盖 AI/开发场景 90% 需求）
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml"; // 也覆盖 html
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";
import yaml from "highlight.js/lib/languages/yaml";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);
hljs.registerLanguage("txt", plaintext);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);

/**
 * useMarkdown - 可复用的 Markdown 渲染逻辑
 *
 * 用于在不同系统中渲染 Markdown 内容，支持代码高亮和复制按钮
 *
 * @example
 * const { renderMarkdown } = useMarkdown({ showCopyButton: true })
 * const html = renderMarkdown('# Hello\n\n```js\ncode\n```')
 */

export interface UseMarkdownOptions {
  showCopyButton?: boolean;
  t?: (key: string) => string; // 多语言翻译函数（可选）
}

export function useMarkdown(options: UseMarkdownOptions = {}) {
  const { showCopyButton = false, t = (key) => key } = options;

  // 创建 marked 渲染器
  const renderer = new marked.Renderer();

  renderer.code = function (
    codeOrToken: string | { text?: string; lang?: string },
    language?: string,
  ) {
    const code = typeof codeOrToken === "object" ? codeOrToken.text || "" : codeOrToken;
    const lang = typeof codeOrToken === "object" ? codeOrToken.lang || "" : language || "";
    const validLang = lang && hljs.getLanguage(lang) ? lang : "plaintext";

    let highlighted = "";
    try {
      highlighted = hljs.highlight(code, { language: validLang }).value;
    } catch {
      highlighted = hljs.highlight(code, { language: "plaintext" }).value;
    }

    // 根据 showCopyButton 选项决定是否添加 Copy 按钮
    const copyButtonHtml = showCopyButton
      ? `<button onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText)" class="of-markdown-copy-btn">${t("common.copy")}</button>`
      : "";

    return `<div class="of-code-block-wrapper">
    <div class="of-code-block-header">
      <span class="of-code-block-lang">${validLang}</span>
      ${copyButtonHtml}
    </div>
    <pre class="of-code-block-pre"><code class="hljs language-${validLang}">${highlighted}</code></pre>
  </div>`;
  };

  marked.use({ renderer });

  /**
   * 渲染 Markdown 文本为 HTML
   */
  function renderMarkdown(content: string): string {
    return marked.parse(content) as string;
  }

  return {
    renderMarkdown,
  };
}
