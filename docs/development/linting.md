# 程式碼檢查（Linting）

## 工具選擇

本專案使用 **[oxlint](https://oxc.rs/docs/guide/usage/linter.html)** 作為 linter，這是一個用 Rust 編寫的高效能 JavaScript/TypeScript linter。

### 為什麼選擇 oxlint？

- **速度極快**：比 ESLint 快 50-100 倍
- **開箱即用**：預設啟用 correctness 規則
- **類型感知**：支援 TypeScript 類型檢查規則
- **相容 ESLint**：配置格式類似 ESLint

## 當前配置

### 配置檔案：`.oxlintrc.json`

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "warn",
    "suspicious": "warn",
    "perf": "warn"
  },
  "rules": {
    "typescript/no-explicit-any": "off",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "warn",
    "typescript/no-extraneous-class": "off",
    "typescript/consistent-return": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "no-console": "warn",
    "no-debugger": "warn",
    "no-await-in-loop": "off",
    "unicorn/prefer-node-protocol": "warn",
    "unicorn/no-lonely-if": "warn",
    "unicorn/no-useless-undefined": "warn",
    "unicorn/consistent-function-scoping": "off"
  },
  "env": {
    "node": true
  }
}
```

### 啟用的插件

預設啟用：
- `unicorn` - 程式碼品質和一致性
- `typescript` - TypeScript 特定規則
- `oxc` - Oxlint 獨有規則

### 啟用的規則類別

- **correctness** (warn)：明顯錯誤或無用的程式碼
- **suspicious** (warn)：很可能錯誤或無用的程式碼
- **perf** (warn)：可以寫得更高效的程式碼

### 自訂規則

#### 啟用的規則

1. **`typescript/no-floating-promises: error`**
   - 禁止未處理的 Promise
   - 防止遺漏 `await` 或 `.catch()`
   - 這是一個**類型感知規則**，需要 `--type-aware` 旗標

2. **`typescript/no-misused-promises: warn`**
   - 防止在不該使用 Promise 的地方使用
   - 例如：在條件判斷中使用 Promise

3. **`no-console: warn`**
   - 警告使用 console.log
   - 生產環境應使用正式的 Logger

4. **`no-debugger: warn`**
   - 警告 debugger 語句
   - 防止 debugger 進入生產環境

5. **`unicorn/prefer-node-protocol: warn`**
   - 建議使用 `node:` 協議引入內建模組
   - 例如：`import fs from 'node:fs'` 而非 `'fs'`

6. **`unicorn/no-lonely-if: warn`**
   - 避免 else 中只有一個 if
   - 可以簡化為 else if

7. **`unicorn/no-useless-undefined: warn`**
   - 避免不必要的 undefined 回傳

#### 關閉的規則（NestJS 專案特定）

1. **`typescript/no-explicit-any: off`**
   - 允許使用 `any` 類型
   - 在快速開發時提供彈性

2. **`typescript/no-extraneous-class: off`**
   - 允許空的類別
   - NestJS 的 Module 類別經常是空的，只用裝飾器定義依賴

3. **`typescript/consistent-return: off`**
   - 允許不一致的 return
   - Telegraf handler 有時需要 early return

4. **`typescript/no-unsafe-type-assertion: off`**
   - 允許類型斷言
   - 測試中經常需要 mock 物件的類型斷言

5. **`no-await-in-loop: off`**
   - 允許迴圈中的 await
   - retry 機制需要循序執行

6. **`unicorn/consistent-function-scoping: off`**
   - 允許函數定義在內部
   - 測試 helper 函數經常定義在 describe 內部

## 使用方式

### 執行 Lint 檢查

```bash
npm run lint
```

等同於：
```bash
oxlint --type-aware src/ test/
```

### 自動修復問題

```bash
npx oxlint --fix src/ test/
```

### 修復建議（可能改變程式行為）

```bash
npx oxlint --fix-suggestions src/ test/
```

### 危險修復（包含可能破壞性的修復）

```bash
npx oxlint --fix-dangerously src/ test/
```

### 只顯示錯誤，忽略警告

```bash
npx oxlint --quiet src/ test/
```

### 將警告視為錯誤

```bash
npx oxlint --deny-warnings src/ test/
```

### 檢查單一檔案

```bash
npx oxlint src/main.ts
```

## 規則類別

Oxlint 支援以下規則類別：

| 類別 | 說明 | 預設 |
|------|------|------|
| `correctness` | 明顯錯誤或無用的程式碼 | ✓ 啟用 |
| `suspicious` | 很可能錯誤或無用的程式碼 | ✗ |
| `pedantic` | 較嚴格的規則，可能有誤報 | ✗ |
| `perf` | 可以寫得更高效的程式碼 | ✗ |
| `style` | 應該用更慣用方式寫的程式碼 | ✗ |
| `restriction` | 防止使用特定語言或函式庫功能 | ✗ |
| `nursery` | 仍在開發中的新規則 | ✗ |

### 啟用更多類別

在命令列啟用：
```bash
npx oxlint -D suspicious -D perf src/
```

在配置檔案啟用：
```json
{
  "categories": {
    "correctness": "warn",
    "suspicious": "warn",
    "perf": "warn"
  }
}
```

## 可選插件

需要時可手動啟用：

```bash
# React 專案
npx oxlint --react-plugin src/

# Jest 測試
npx oxlint --jest-plugin test/

# Vitest 測試
npx oxlint --vitest-plugin test/

# Import 問題檢測
npx oxlint --import-plugin src/

# JSDoc 檢查
npx oxlint --jsdoc-plugin src/

# Node.js 特定規則
npx oxlint --node-plugin src/

# Promise 使用檢查
npx oxlint --promise-plugin src/
```

## 類型感知規則

### 什麼是類型感知規則？

類型感知規則需要 TypeScript 類型資訊才能運作，例如：
- `typescript/no-floating-promises` - 檢查未處理的 Promise
- `typescript/await-thenable` - 確保只 await Thenable 物件
- `typescript/no-unnecessary-type-assertion` - 偵測不必要的類型斷言

### 啟用方式

必須加上 `--type-aware` 旗標：

```bash
oxlint --type-aware src/
```

### 指定 tsconfig

如果專案使用非標準的 tsconfig 位置：

```bash
oxlint --type-aware --tsconfig=./tsconfig.build.json src/
```

## 忽略檔案

### 使用 .eslintignore

建立 `.eslintignore` 檔案：
```
node_modules/
dist/
coverage/
*.generated.ts
```

### 命令列忽略模式

```bash
npx oxlint --ignore-pattern "**/*.generated.ts" src/
```

### 在程式碼中忽略

```typescript
// 忽略下一行
// oxlint-disable-next-line no-debugger
debugger;

// 忽略整個檔案
/* oxlint-disable */

// 忽略特定規則
/* oxlint-disable typescript/no-explicit-any */
function test(data: any) { }
/* oxlint-enable typescript/no-explicit-any */
```

## 整合到 CI/CD

### GitHub Actions

```yaml
- name: Lint
  run: npm run lint
```

### 將警告視為錯誤（CI 環境）

```yaml
- name: Lint (strict)
  run: npx oxlint --deny-warnings src/ test/
```

### 設定最大警告數

```bash
npx oxlint --max-warnings=0 src/
```

## 與 Prettier 搭配

Oxlint 專注於程式碼品質，不處理格式化。格式化交給 Prettier：

```bash
# 格式化
npm run format

# 檢查
npm run lint
```

## 輸出格式

### 預設格式（適合終端機）

```bash
npx oxlint src/
```

### JSON 格式（適合程式解析）

```bash
npx oxlint --format=json src/
```

### GitHub Actions 格式

```bash
npx oxlint --format=github src/
```

### 其他支援格式

- `checkstyle` - Checkstyle XML 格式
- `gitlab` - GitLab Code Quality 格式
- `junit` - JUnit XML 格式
- `sarif` - SARIF 格式
- `stylish` - 類似 ESLint stylish
- `unix` - Unix 風格輸出

## 除錯選項

### 查看將被檢查的檔案

```bash
npx oxlint --debug=files src/
```

### 顯示每個規則的執行時間

```bash
npx oxlint --debug=timings src/
```

### 查看當前配置

```bash
npx oxlint --print-config src/main.ts
```

## 效能提示

1. **只檢查需要的目錄**：`oxlint src/` 比 `oxlint .` 快
2. **類型感知規則較慢**：只在 CI 或 pre-commit 使用
3. **使用 `.eslintignore`**：排除不需要檢查的檔案

## 常見問題

### Q: 如何完全停用某個規則？

在 `.oxlintrc.json` 中：
```json
{
  "rules": {
    "no-debugger": "off"
  }
}
```

### Q: 如何將某個規則改為警告？

```json
{
  "rules": {
    "no-console": "warn"
  }
}
```

### Q: 如何啟用所有規則？

```bash
npx oxlint -D all src/
```

或在配置檔案：
```json
{
  "categories": {
    "correctness": "warn",
    "suspicious": "warn",
    "pedantic": "warn",
    "perf": "warn",
    "style": "warn"
  }
}
```

### Q: 為什麼類型感知規則不運作？

確保：
1. 加上 `--type-aware` 旗標
2. tsconfig.json 存在且正確
3. 專案已經成功編譯過

### Q: 如何初始化配置？

```bash
npx oxlint --init
```

會建立一個包含預設值的 `.oxlintrc.json`。

## 未來規劃

考慮啟用的規則類別：
- [ ] `suspicious` - 可疑的程式碼模式
- [ ] `perf` - 效能優化建議
- [ ] `import-plugin` - Import 語句檢查
- [ ] `promise-plugin` - Promise 使用最佳實踐

## 參考資源

- [Oxlint 官方文檔](https://oxc.rs/docs/guide/usage/linter.html)
- [規則列表](https://oxc.rs/docs/guide/usage/linter/rules.html)
- [配置參考](https://oxc.rs/docs/guide/usage/linter/config.html)
- [與 ESLint 比較](https://oxc.rs/docs/guide/usage/linter.html#eslint-compatibility)
