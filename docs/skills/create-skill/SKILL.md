---
name: create-skill
description: 創建符合項目規範的技能文件，使用模塊化結構
disable-model-invocation: true
---

# Create Skill

創建符合項目規範的技能文件，使用模塊化結構。

## 輸入

用戶應該提供：
- 技能名稱（kebab-case）
- 技能要做什麼（一句話描述）

## 步驟

### 1. 判斷技能類型

**原子技能 vs 工作流技能：**

| 類型 | 特徵 | 長度 | 命名 |
|------|------|------|------|
| **原子技能** | 直接執行具體任務 | 50-200 行 | `<verb>-<noun>` |
| **工作流技能** | 編排調用其他技能 | < 50 行 | `<name>-workflow` |

**判斷標準：**
- 主要是"調用 /xxx" → 工作流技能
- 主要是具體實現步驟 → 原子技能
- 步驟可獨立使用 → 拆成多個原子技能 + 工作流技能
- 步驟緊密耦合 → 單一原子技能

### 2. 創建文件結構

基礎結構：
```bash
docs/skills/<skill-name>/
└── SKILL.md              # 主文件（必須）
```

擴展時可添加：
```bash
docs/skills/<skill-name>/
├── SKILL.md              # 核心流程
├── agents/               # sub-agent 配置（可選）
└── *.md                  # 參考文檔（可選）
```

### 3. 寫 Frontmatter

**必須**使用 `AskUserQuestion` 詢問用戶以下配置（每次都必須詢問）：

**問題 1：「這個技能允許 Claude 自動調用嗎？」**
- 選項：
  - **「允許自動調用（推薦）」** → 不加 `disable-model-invocation`
    - 適用：通用任務、AI 可自動判斷時機
  - **「僅允許手動調用」** → 加 `disable-model-invocation: true`
    - 適用：危險操作、需明確確認的流程

**問題 2：「用戶可以看到並手動調用這個技能嗎？」**
- 選項：
  - **「用戶可調用（推薦）」** → 不加 `user-invocable` 或設為 `true`
    - 出現在 `/` 選單中
  - **「僅供內部使用」** → 加 `user-invocable: false`
    - 適用：子流程、內部工具

詳細配置見 [templates.md](templates.md#frontmatter-配置)

### 4. 寫核心內容

使用對應的模板：
- 原子技能 → 見 [templates.md](templates.md#原子技能模板)
- 工作流技能 → 見 [templates.md](templates.md#工作流技能模板)

**核心結構：**
```markdown
# 標題

一句話說明

## 輸入
需要什麼參數

## 步驟
1. 做什麼
2. 做什麼
3. 做什麼

## 輸出
返回什麼
```

**保持簡潔：**
- 每個步驟 1-3 行說明
- 必要時用子列表補充細節
- 避免大段文字

### 5. 驗證質量

**設計原則檢查：**
- [ ] **可執行性**
  - 能用一句話說清楚這個技能做什麼
  - AI 看完能立即執行
- [ ] **最小化**
  - 是一個"原子操作"（不能再拆小，或明確是工作流）
  - 沒有"以防萬一"的內容
  - 只做一件事
- [ ] **自包含**
  - 不看其他文檔，能理解 80%
  - 外部依賴 < 3 個
  - 依賴的內容不會頻繁變化

**文件規範檢查：**
- [ ] frontmatter 正確（name, description, 配置選項）
- [ ] description 清楚（功能 + 觸發時機）
- [ ] `disable-model-invocation` 設置正確
- [ ] 輸入/輸出明確具體
- [ ] 步驟清晰（原子技能 3-7 步，工作流 < 50 行）
- [ ] SKILL.md < 200 行
- [ ] 外部引用 < 3 個
- [ ] 文件夾名 = frontmatter name

詳細規範見 [guide.md](guide.md#命名規則)

**檢查未通過時：**
- **自動修正：** SKILL.md > 200 行 → 建議拆分或移出部分內容到參考文檔
- **報錯阻止：** 文件夾名 ≠ frontmatter name → 必須修正後才能繼續
- **詢問用戶：** 外部引用 > 3 個 → 確認是否接受（可能影響自包含性）

## 輸出

使用以下格式報告：

```
✅ 技能創建完成

路徑：docs/skills/<skill-name>/
名稱：<skill-name>
描述：<description>
類型：[原子技能 / 工作流技能]
調用方式：
  - 手動：/<skill-name> [參數]
  - 自動：[是 / 否]

文件清單：
  - SKILL.md (XX 行)
  - templates.md (可選)
```

**請用戶測試：**
```bash
# 方法 1：直接調用
/<skill-name> <參數>

# 方法 2：在對話中觸發（如果允許自動調用）
"幫我 <做技能描述的事情>"
```

**測試通過標準：**
- ✅ 手動調用能找到技能並執行
- ✅ 自動觸發時 AI 能識別並調用（如果未設置 disable-model-invocation）

## 參考

- [templates.md](templates.md) — Skill 模板與 frontmatter 配置
- [guide.md](guide.md) — 命名規則與常見反模式
