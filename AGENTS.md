## 語言設定

**使用繁體中文進行所有問答、文檔撰寫與代碼註釋。**

例外：修改既有的文件類檔案（Markdown、純文字、reStructuredText、AsciiDoc 等）時，沿用該檔案原本的語言。例如英文檔案就用英文增修，不混入中文。檔案本身中英混雜時或新建的文件都使用繁體中文。

## Agent skills

### Issue tracker

Issues 以 Markdown 文件形式存放在 `.scratch/` 下：feature 放 `.scratch/features/<NNN>-<slug>/`，bug 放 `.scratch/bugs/<NNN>-<slug>.md`。見 `docs/agents/issue-tracker.md`。

### Triage labels

使用五個默認 triage 標籤（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`）。見 `docs/agents/triage-labels.md`。

### Architecture

系統整體架構、模塊設計、技術棧選擇見根目錄 `ARCHITECTURE.md`。

### Domain docs

Single-context 佈局：根目錄 `GLOSSARY.md` + `docs/adr/`。見 `docs/agents/domain.md`。

### NestJS framework

見 `docs/agents/nestjs.md` 或 [NestJS 官方文檔](https://docs.nestjs.com/llms.txt)。
