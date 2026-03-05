# oxfmt 代码格式化配置说明

## ✅ 已完成的配置

### 1. 安装 oxfmt
```bash
pnpm add -D oxfmt
```

### 2. 格式化脚本 (package.json)
```json
{
  "scripts": {
    "format": "oxfmt --write src",       // 自动格式化所有文件
    "format:check": "oxfmt --check src"  // 检查格式是否正确
  }
}
```

### 3. 配置文件 (.prettierrc)
- 单引号：`'` 代替 `"`
- 无分号结尾
- Tab 宽度：2 空格
- 单行最大字符：100

### 4. VS Code 编辑器配置 (.vscode/settings.json)
- 保存文件时自动格式化
- 支持 Vue、TypeScript、JavaScript、JSON 文件

---

## 📝 使用方式

### 方式 1：手动格式化
```bash
# 格式化所有代码
pnpm format

# 仅检查格式（不修改）
pnpm format:check
```

### 方式 2：保存时自动格式化
在 VS Code 中打开任何 .vue / .ts / .js 文件，保存时会自动格式化。

**当前状态**：VS Code 需要安装对应的格式化工具扩展
- 推荐使用：Ruff 扩展或其他支持 oxfmt 的 VS Code 扩展

---

## 📊 格式化结果

**初始化结果**：
- 扫描文件数：83 个
- 需要格式化：82 个文件
- 格式化耗时：880ms
- 完成后状态：✅ 全部格式化正确

---

## 🚀 后续工作流

### 开发流程
```
1. 编写代码
2. 保存文件（自动格式化）
3. 提交前运行 pnpm format:check 验证
4. git add && git commit
```

### AI 生成代码的处理
```
1. AI 生成代码写入文件
2. 运行 pnpm format 自动整洁
3. 代码风格统一
```

---

## 📌 重要提示

- ✅ oxfmt 配置已完成
- ✅ 所有源代码已格式化
- ⚠️ 如果需要 Git Hook 自动化（提交前自动格式化），请额外配置 husky

---

## 配置文件位置

- `package.json` - npm 脚本配置
- `.prettierrc` - oxfmt 配置规则
- `.vscode/settings.json` - VS Code 编辑器配置
- 本文件 - 配置说明文档

