# Issue tracker: Local Markdown

Issues, specs and bug reports for this repo live as markdown files in `.scratch/`, split into two trees:

```
.scratch/
├── features/
│   └── <NNN>-<feature-slug>/
│       ├── spec.md
│       ├── map.md              # wayfinding only (optional)
│       └── issues/
│           └── <NN>-<slug>.md
└── bugs/
    └── <NNN>-<slug>.md
```

## Conventions

### Features

- One feature per directory: `.scratch/features/<NNN>-<feature-slug>/` (see Numbering below)
- The spec is `.scratch/features/<NNN>-<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/features/<NNN>-<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file

### Bugs

- Bugs reported by QA or anyone else go in `.scratch/bugs/`, never in a feature's `issues/`
- One bug per file: `.scratch/bugs/<NNN>-<slug>.md`
- A `Feature: F001` line near the top links the bug to its feature; use `Feature: none` when it relates to no feature
- If a fix needs several steps, open issues in the related feature's `issues/` and add a `Fixes: B007` line to each

### Shared

- Triage state is recorded as a `Status:` line near the top of each issue or bug file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Numbering

No GitHub / GitLab integration. Numbers are managed locally through directory and file names. Features and bugs are numbered independently.

- **Feature number**: three digits, starting at `001`, used as the directory prefix, e.g. `.scratch/features/001-user-auth/`.
- **Bug number**: three digits, starting at `001`, used as the file name prefix, e.g. `.scratch/bugs/001-email-case-conflict.md`.
- **Allocating a number**:
  - Feature: scan `.scratch/features/` for directories matching `^\d{3}-`, take the highest number + 1
  - Bug: scan `.scratch/bugs/` for files matching `^\d{3}-.*\.md$`, take the highest number + 1
  - Start at `001` when the directory is missing or empty
- **No reuse**: numbers of deleted, abandoned (`wontfix`) or merged features and bugs are never reclaimed. Keep abandoned items and mark their status instead of deleting them.
- **Issue number**: numbered independently from `01` inside each feature's `issues/`, same rules (highest + 1, no reuse).
- **Reference format**:
  - Feature: `F001`; issue: `F001-03` (issue 03 of feature 001)
  - Bug: `B001`
  - Use these in commit messages, `Blocked by:` (across features), `Feature:`, `Fixes:` and conversation. Within one feature, `Blocked by:` may use just `03`.
- **Slug**: lowercase kebab-case English. Never rename after creation, so references stay valid.

## When a skill says "publish to the issue tracker"

- Feature issue: create a new file in `.scratch/features/<NNN>-<feature-slug>/issues/`. For a new feature, allocate the next number per Numbering above and create the directory.
- Bug: allocate the next number per Numbering above and create a new file in `.scratch/bugs/` (create the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or a reference; resolve it by globbing:

| Reference | Glob |
|-----------|------|
| `F001` | `.scratch/features/001-*/` |
| `F001-03` | `.scratch/features/001-*/issues/03-*.md` |
| `B001` | `.scratch/bugs/001-*.md` |

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/features/<NNN>-<effort-slug>/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `.scratch/features/<NNN>-<effort-slug>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/features/<NNN>-<effort-slug>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
