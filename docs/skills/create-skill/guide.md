# 命名與設計指南

## 命名規則

### 基本格式

- **原子技能**：`<verb>-<noun>`（動詞-名詞）
- **工作流技能**：`<name>-workflow`（必須以 -workflow 結尾）
- **風格**：kebab-case，動詞開頭，簡短有力

### 原子技能命名

**✅ 好的命名**
- `create-issue` — 清晰的動作 + 對象
- `triage` — 簡潔、專業術語
- `add-adr` — 明確的操作
- `deploy-service` — 具體的部署動作

**❌ 不好的命名**
- `process-issue` — 太模糊（process 是什麼？）
- `handleStuff` — camelCase（應該用 kebab-case）
- `do-everything` — 太寬泛
- `issue` — 沒有動詞

### 常用動詞

| 動詞 | 用途 | 示例 |
|------|------|------|
| `create-` | 創建新內容 | `create-issue` |
| `update-` | 修改現有內容 | `update-deps` |
| `check-` | 驗證檢查 | `check-types` |
| `deploy-` | 部署發布 | `deploy-service` |
| `add-` | 添加內容 | `add-adr` |
| `fix-` | 修復問題 | `fix-lint` |

### 工作流技能命名

**✅ 好的命名**
- `feature-workflow` — 端到端功能開發流程
- `release-workflow` — 發布流程
- `hotfix-workflow` — 緊急修復流程

**❌ 不好的命名**
- `feature-flow` — 必須用 `-workflow` 後綴
- `workflow-release` — 後綴位置錯誤

## 文件夾結構

```
docs/skills/<skill-name>/     ← kebab-case，與 frontmatter name 一致
├── SKILL.md                   ← 固定大寫
├── agents/                    ← 小寫（可選）
│   └── reviewer.md           ← kebab-case
└── guide.md                  ← kebab-case（可選）
```

**規則：**
- 文件夾名 = `frontmatter.name`
- 主文件 = `SKILL.md`（全大寫，固定）
- Sub-agent 配置 = `agents/<name>.md`
- 參考文檔 = 描述性命名

## 常見反模式

### 反模式 1：假裝單一的串燒技能

**❌ 錯誤示例**
```markdown
# create-feature

## 步驟
1. 在 .scratch/ 創建目錄
2. 寫 spec.md
3. 創建 issue 文件
4. 設置 triage 標籤
5. 用 nest CLI 生成模塊
```

**問題：**
- 做了太多事
- 每一步都可以獨立使用
- 沒有明確說明是"工作流"

**✅ 正確做法**

拆成多個原子技能 + 一個工作流技能：

```markdown
# feature-workflow

從提案到實現的完整流程。

**這是一個工作流技能，編排多個獨立技能。**

## 步驟

1. **創建 Issue**
   - 調用 `/create-issue <feature>`

2. **分類評估**
   - 調用 `/triage`

3. **設置環境**
   - 調用 `/setup-environment <feature>`
```

### 反模式 2：過度設計

**❌ 錯誤示例**
```markdown
## 背景
在現代軟件開發中，我們需要一個健壯的系統...
<大段文字 50+ 行>

## 理論基礎
根據軟件工程最佳實踐...
<大段文字 40+ 行>
```

**語言信號（出現這些詞就說明過度了）：**
- "本技能旨在..." — 刪掉，直接說做什麼
- "首先我們需要理解..." — 刪掉，不是教程
- "綜上所述..." — 刪掉，不是論文
- 超過 5 個參考鏈接 — 太多了

**✅ 正確做法**
```markdown
# Triage

對 issue 進行評估和打標籤。

## 輸入
- Issue 路徑

## 步驟
1. 讀取 issue
2. 評估完整性
3. 設置標籤

## 輸出
- 新狀態
- 理由
```

### 反模式 3：工作流技能太長

**❌ 錯誤示例**
```markdown
# deploy-workflow

## 步驟

1. **構建**
   - 運行 npm install
   - 檢查 node_modules 大小
   - 運行 npm run build
   - 驗證 dist 目錄
   <20 行實現細節>
```

**問題：**
- 工作流技能超過 50 行
- 包含大量實現細節
- 不是"調用"語句

**✅ 正確做法**

工作流技能（< 50 行）：
```markdown
# deploy-workflow

端到端部署流程。

## 步驟
1. **構建** - 調用 `/build`
2. **測試** - 調用 `/run-tests`
3. **部署** - 調用 `/deploy-to-prod`
```

原子技能（實現細節）：
```markdown
# build

構建生產版本。

## 步驟
1. 安裝依賴：`npm install`
2. 構建：`npm run build`
3. 驗證 dist/ 目錄存在

## 輸出
- 構建產物路徑
```

### 反模式 4：模糊的輸入輸出

**❌ 錯誤**
```markdown
## 輸入
- 一些參數

## 輸出
- 結果
```

**✅ 正確**
```markdown
## 輸入

用戶應該提供：
- `feature-name`（必需）：kebab-case 格式的功能名稱
- `priority`（可選）：high/medium/low，默認 medium

## 輸出

報告：
- Issue 文件路徑：`.scratch/<feature>/issue.md`
- Triage 標籤：`needs-triage`
- 下一步：等待人工 review
```

## 檢查清單

創建技能後用這個清單檢查：

### 可執行性
- [ ] 能用一句話說清楚這個技能做什麼
- [ ] 輸入和輸出明確
- [ ] AI 看完能立即執行

### 最小化
- [ ] 是一個"原子操作"（不能再拆小）
- [ ] 沒有"以防萬一"的內容
- [ ] 只做一件事

### 自包含
- [ ] 不看其他文檔，能理解 80%
- [ ] 外部依賴 < 3 個
- [ ] 依賴的內容不會頻繁變化

### 文件規範
- [ ] frontmatter 正確
- [ ] description 清楚（功能 + 觸發時機）
- [ ] SKILL.md < 200 行
- [ ] 文件夾名 = frontmatter name

### 類型判斷
- [ ] 明確是原子技能還是工作流技能
- [ ] 工作流技能名稱以 `-workflow` 結尾
- [ ] 工作流技能 < 50 行
