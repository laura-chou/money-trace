# AI Development Rules

## 1. Planning Required (IMPORTANT)
All changes MUST follow a planning step before implementation.

- Before making any code changes, the agent must first produce a clear plan.
- The plan must include:
  - What files will be modified
  - What changes will be made
  - Why the changes are needed
  - Any potential risks or side effects

🚫 Do NOT start coding before the plan is approved.

---

## 2. Approval Gate
- After generating the plan, the agent must wait for human approval.
- Only proceed with implementation after explicit approval is given.

---

## 3. Commit Messages
- All commit messages must be written in English only.
- Never use Chinese in commit messages.
- Use Conventional Commits format:
  - feat: new feature
  - fix: bug fix
  - refactor: code refactoring
  - style: UI/formatting changes

---

## 4. Code Safety Rules
- Avoid modifying financial calculation logic unless explicitly requested.
- Prefer small, incremental changes over large refactors.
- Always keep changes reversible.