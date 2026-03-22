#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${1:-/tmp/oneui_pkg_entry_084}"
TARBALL_PATH="${2:-}"
VITE_VERSIONS=("5.4.21" "8.0.1")

resolve_plugin_vue_version() {
  case "$1" in
    5.*) echo "5.2.4" ;;
    8.*) echo "6.0.5" ;;
    *)
      echo "unsupported vite version: $1" >&2
      return 1
      ;;
  esac
}

if [[ -z "$TARBALL_PATH" ]]; then
  TARBALL_PATH="$(find "$OUT_DIR" -maxdepth 1 -name '*.tgz' | head -n 1)"
fi

if [[ -z "$TARBALL_PATH" || ! -f "$TARBALL_PATH" ]]; then
  echo "tarball not found: $TARBALL_PATH" >&2
  exit 1
fi

for VITE_VERSION in "${VITE_VERSIONS[@]}"; do
  APP_DIR="$OUT_DIR/consumer-$VITE_VERSION"
  PLUGIN_VUE_VERSION="$(resolve_plugin_vue_version "$VITE_VERSION")"
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR/src"

  node - "$APP_DIR/package.json" "$TARBALL_PATH" "$VITE_VERSION" "$PLUGIN_VUE_VERSION" <<'NODE'
const fs = require("node:fs");
const [packageJsonPath, tarballPath, viteVersion, pluginVueVersion] = process.argv.slice(2);
const pkg = {
  name: `oneui-consumer-${viteVersion}`,
  private: true,
  type: "module",
  scripts: {
    build: "vite build",
  },
  dependencies: {
    "@oneflowui/ui": `file:${tarballPath}`,
    vue: "^3.4.0",
  },
  devDependencies: {
    "@vitejs/plugin-vue": `^${pluginVueVersion}`,
    vite: viteVersion,
  },
};
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
NODE

  cat >"$APP_DIR/vite.config.ts" <<'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
EOF

  cat >"$APP_DIR/src/main.ts" <<'EOF'
import { createApp, h } from 'vue'
import { ThemeScope, StatisticCard } from '@oneflowui/ui'
import { useVirtualListStateCache } from '@oneflowui/ui/composables'
import type { DataRecord } from '@oneflowui/ui/types'
import '@oneflowui/ui/theme'

const cache = useVirtualListStateCache('consumer-smoke')
const records: DataRecord[] = [{ id: '1', fields: { title: 'ok' } }]

createApp({
  setup() {
    return () =>
      h(ThemeScope, { theme: 'ops-console', tag: 'section' }, {
        default: () => [
          h(StatisticCard, { title: 'Smoke', value: 'OK' }),
          h('div', `${cache.containerHeight.value}-${records.length}`),
        ],
      })
  },
}).mount('#app')
EOF

  cat >"$APP_DIR/index.html" <<'EOF'
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF

  (
    cd "$APP_DIR"
    npm install >"$OUT_DIR/consumer-$VITE_VERSION-install.log" 2>&1
    npm run build >"$OUT_DIR/consumer-$VITE_VERSION-build.log" 2>&1
  )
done

echo "smoke ok: $TARBALL_PATH"
echo "logs dir: $OUT_DIR"
