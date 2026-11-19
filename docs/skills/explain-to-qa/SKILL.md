---
name: explain-to-qa
description: |
  把 Claude 對 QA 提問的技術回答，改寫成 QA 看得懂的白話說明；確認是 bug 時，直接在 .scratch/bugs/ 開 bug 單並標上 feature 單號。
  觸發時機：用戶下 /explain-to-qa，並貼上（或指向）Claude 剛才對 QA 問題的回答。
  不要觸發：從零調查 bug、修 bug、寫測試案例。
disable-model-invocation: true
---

# Explain to QA

QA 遇到疑似 bug 會來問 Claude，Claude 的回答通常充滿程式碼位置、函式名稱與框架術語。這個技能把那份回答翻成 QA 看得懂的話。確認是 bug 時，同時在 `.scratch/bugs/` 開 bug 單。

## 輸入

用戶應該提供：
- QA 的原始提問
- Claude 的回答：貼上原文，或說「上面那段」指對話中的回答
- feature 單號：bug 跟哪個 feature 有關，格式 `F001`。沒給又需要開單時，先問；確定與 feature 無關就填 `none`

## 步驟

1. **讀懂 Claude 的回答，抓出三件事**
   - 結論：是 bug、符合設計，還是查不出來
   - 原因：用一句話講發生了什麼，不講程式碼怎麼寫
   - QA 下一步要做什麼
   - 回答本身沒有明確結論時，照實寫「尚未確認」，不要自己補判斷

2. **翻成白話**
   - 用畫面、按鈕、操作、資料來描述，不用函式名稱、檔案路徑、HTTP 狀態碼、框架術語
   - 非提不可的技術詞，括號附一句解釋，例如「快取（系統暫存的舊資料）」
   - 套用下方「給 QA 的說明」模板

3. **判斷要不要開 bug 單**
   - Claude 的回答確認是 bug → 開單，進步驟 4
   - 符合設計、資訊不足、尚未確認 → 不開，只輸出說明

4. **寫 bug 單**
   - 路徑：`.scratch/bugs/<NNN>-<slug>.md`，`NNN` 取該目錄下現有最大編號 +1，從 `001` 起算；目錄不存在就建立
   - slug 用小寫 kebab-case 英文描述現象
   - 使用下方「Bug 單模板」。bug 單給開發看，所以保留 Claude 回答中的技術細節（`path:line`、原因、修正方向）
   - `Status:` 依 Claude 回答判斷：修正方向明確 → `ready-for-agent`；需要人決定或改動大 → `ready-for-human`
   - 編號與欄位規則以 `docs/agents/issue-tracker.md` 為準

5. **輸出**
   - 先給「給 QA 的說明」，有開單的話再附 bug 單號與路徑

## 給 QA 的說明（模板）

```markdown
**結論：** <是 bug / 不是 bug，這是設計如此 / 還需要更多資訊 / 尚未確認>

**發生了什麼：** <一到兩句白話說明原因>

**你可以怎麼做：**
1. <QA 接下來的操作，例如：等修正後重測、補提供某項資訊、照某步驟確認>

**已開單：** <B001>（相關功能 <F001>；沒開單就刪掉這行）
```

## Bug 單模板

```markdown
# B<NNN> <問題標題，描述現象>

Status: <ready-for-agent / ready-for-human>
Feature: <F001 / none>
Reported by: QA

## 現象
<QA 看到的行為>

## 重現步驟
1. <步驟>

## 預期結果
<應該怎樣>

## 實際結果
<實際怎樣>

## 原因
<Claude 回答中的技術說明，含 `path:line`>

## 修正方向
<Claude 回答中的建議；沒有就寫「待評估」>

## Comments
```

## 示例

**QA 提問：** 「用大寫 email 註冊，系統說已被註冊，可是我沒註冊過這個大寫的。」

**Claude 的回答（節錄）：** 「`users.service.ts:42` 的 `create()` 會先 `toLowerCase()` 再查重，依 ADR-0003 email 不分大小寫，所以回 409 Conflict 是預期行為。」

**輸出：**

```markdown
**結論：** 不是 bug，這是設計如此

**發生了什麼：** 系統把 email 當成不分大小寫。`Foo@Example.com` 和 `foo@example.com` 會被視為同一個帳號，所以才提示已被註冊。

**你可以怎麼做：**
1. 改用一個完全沒註冊過的 email 測試
2. 如果覺得提示文字容易讓人誤會，可以回報給產品
```

（不是 bug，所以不開單。）

## 檢查清單

- [ ] 給 QA 的說明裡沒有檔案路徑、函式名稱、狀態碼
- [ ] 結論和 Claude 的回答一致，沒有自己加判斷
- [ ] 確認是 bug 時才開單，檔案在 `.scratch/bugs/`，不在 feature 的 `issues/`
- [ ] bug 單有 `Feature:` 與 `Status:`
- [ ] bug 編號沒有和現有檔案衝突
- [ ] 沒有改動任何程式碼

## 輸出

- 給 QA 的說明，用 markdown code block 包起來，方便直接貼給 QA
- 有開單時，附上 bug 單號（如 `B003`）、檔案路徑與 `Status:`
