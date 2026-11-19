# Skill 模板與配置

## 原子技能模板

```markdown
---
name: <kebab-case-name>
description: <一句話描述，用於 AI 匹配調用時機>
---

# <技能標題>

<一段話說明這個技能是做什麼的>

## 輸入

用戶應該提供：
- <參數 1>：<說明>
- <參數 2>（可選）：<說明>

## 步驟

1. **<步驟 1>**
   - <具體做什麼>
   - <注意事項>

2. **<步驟 2>**
   - <具體做什麼>

3. **<步驟 3>**
   - <具體做什麼>

## 輸出

報告：
- <輸出項 1>
- <輸出項 2>

## 示例（可選）

<如果流程不夠清晰，給一個具體例子>

## 參考（可選，少於 3 個）

- [相關文檔](路徑) - 簡短說明
```

**特徵：**
- 長度：50-200 行
- 命名：`<verb>-<noun>` 格式
- 職責：直接執行具體任務
- 自包含：不依賴其他技能

## 工作流技能模板

```markdown
---
name: <name>-workflow
description: <描述端到端的業務流程>
---

# <標題> Workflow

<說明這是一個工作流編排技能>

**這是一個工作流技能，編排多個獨立技能完成端到端流程。**

## 輸入

- <參數>

## 步驟

1. **<階段 1>**
   - 調用 `/skill-1 <params>`
   - 調用 `/skill-2 <params>`

2. **<階段 2>**
   - 調用 `/skill-3 <params>`
   
3. **<階段 3>**
   - 調用 `/skill-4 <params>`

## 輸出

- <彙總的輸出>

## 注意

所有被調用的技能都可以單獨使用，不依賴此工作流。
```

**特徵：**
- 長度：< 50 行
- 命名：必須以 `-workflow` 結尾
- 職責：編排調用其他技能
- 編排性：主要是 "調用 /xxx" 語句

## Frontmatter 配置

### 基礎結構

```yaml
---
name: <kebab-case-name>
description: <詳細描述>
---
```

### 配置選項

#### disable-model-invocation

**允許自動調用**（默認）
- 不加 `disable-model-invocation`
- Claude 可根據 description 自動判斷並調用
- 適用：model-invoked skills（如 `tdd`、`research`）

**僅允許手動調用**
- 加上 `disable-model-invocation: true`
- 只能通過 `/skill-name` 調用
- 適用：危險操作、需明確確認的流程

#### user-invocable

**用戶可調用**（默認）
- 不加 `user-invocable` 或設為 `true`
- 出現在 `/` 選單中

**僅供 Claude 內部使用**
- 加上 `user-invocable: false`
- 不出現在 `/` 選單中
- 適用：子流程、內部工具

### 配置示例

**示例 1：默認（自動 + 用戶可調用）**
```yaml
---
name: tdd
description: Test-driven development with red-green-refactor loop
---
```

**示例 2：僅手動調用**
```yaml
---
name: implement
description: Implement a piece of work based on a spec or set of tickets
disable-model-invocation: true
---
```

**示例 3：僅供內部使用**
```yaml
---
name: internal-helper
description: 內部輔助工具
user-invocable: false
---
```

### Description 寫法

**簡短型**（< 80 字符）
```yaml
description: "Implement a piece of work based on a spec or set of tickets."
```

**詳細型**（功能 + 觸發時機）
```yaml
description: "Review code changes along two axes: Standards and Spec. Use when the user wants to review a branch, PR, or asks to 'review since X'."
```

**三段式**（說明 + 觸發 + 不要觸發）
```yaml
description: |
  「說人話」：繁體中文的去 AI 味改寫 skill。
  觸發時機：用戶說「去 AI 味」「說人話」「改自然一點」。
  不要觸發：逐字翻譯、事實查核、程式碼。
```

### 決策樹

```
1. 是否允許 AI 自動調用？
   ├─ 是 → 不加 disable-model-invocation（默認）
   └─ 否 → 加 disable-model-invocation: true

2. 用戶是否需要手動調用？
   ├─ 是 → 不加 user-invocable（默認）
   └─ 否 → 加 user-invocable: false

3. Description 風格？
   ├─ 簡單原子技能 → 簡短型
   ├─ Model-invoked → 詳細型（+ 觸發時機）
   └─ 需精確控制 → 三段式
```
