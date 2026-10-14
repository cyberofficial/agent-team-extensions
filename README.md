# dsh-plugin-agent-team-clone

A renamed, self-contained clone of the **DSH Agent Teams** experimental plugin
system (`@deepseek-ai/dsh-experimental-agent-team*` v0.2.0-rc.2), reconstructed
from the installed packages of DeepSeek Harness. All behavior is preserved; only
identity is renamed so the clone can coexist with (or replace) the original
without collisions.

Provenance: cloned from `@deepseek-ai/dsh-experimental-agent-team`,
`-tool-agent-team`, `-client-ui-agent-team`, and `-agent-team-profile`
v0.2.0-rc.2 (MIT, github.com/deepseek-ai/deepseek-harness). Original LICENSE
files are kept in each package.

## Layout

| Folder | Original package | Clone npm name | Cordis id |
|---|---|---|---|
| `packages/agent-team/` | `@deepseek-ai/dsh-experimental-agent-team` | `dsh-agent-team-clone-core` | `agent-team-clone` |
| `packages/tool-agent-team/` | `@deepseek-ai/dsh-experimental-tool-agent-team` | `dsh-agent-team-clone-tools` | `tool-agent-team-clone` |
| `packages/client-ui-agent-team/` | `@deepseek-ai/dsh-experimental-client-ui-agent-team` | `dsh-agent-team-clone-ui` | `ui-agent-team-clone` |
| `packages/agent-team-profile/` | `@deepseek-ai/dsh-experimental-agent-team-profile` | `dsh-agent-team-clone-profile` | (bundle) |

## What each package does

- **agent-team (core)** — implicit-root Agent Teams roster, durable peer mailbox,
  and shared task DAG. Registers the ctx service under `ctx.agentTeamsClone`
  (original: `ctx.agentTeams`).
- **tool-agent-team (tools)** — the model-facing team tools, scoped over the core
  service. Every tool is prefixed `clone_`:
  `clone_spawn_teammate`, `clone_send_message`, `clone_list_agents`,
  `clone_wait_agent`, `clone_interrupt_agent`, `clone_team_task_create`,
  `clone_team_task_list`, `clone_team_task_get`, `clone_team_task_update`
  (final list: see Verification below).
- **client-ui-agent-team (ui)** — the Web Team Panel: roster, task board, and
  teammate navigation.
- **agent-team-profile (bundle)** — the one-row bundle that wires the three
  components above (its `cordis.patch.yml` inserts the three plugin rows and
  disables the direct-subagent tools, exactly like the original profile).

## Enabling

The clone is NOT enabled by anything on this machine. To enable it in a profile
(e.g. the `web` profile at `~/.dsh/profiles/web`, which is a pnpm workspace):

1. Install the clone packages into the profile workspace, e.g. add to the
   profile `package.json` dependencies:
   `"dsh-agent-team-clone-core": "file:/home/cyber/DSH-Plugins/dsh-plugin-agent-team-clone/packages/agent-team"`
   (and likewise `-tools`, `-ui`, `-profile`), then `pnpm install`.
2. Add the three insert rows from this folder's `cordis.patch.yml` to the
   profile's `cordis.patch.yml` (or depend on `dsh-agent-team-clone-profile`,
   whose own patch does the same), then restart the profile.
3. Disable the original Agent Teams bundle first — original and clone define
   parallel team machinery, and the patch layer disables the direct-subagent
   tools for both.

## Differences from the original (complete list by design)

- npm package names: `dsh-agent-team-clone-{core,tools,ui,profile}`.
- Cordis plugin ids: `agent-team-clone`, `tool-agent-team-clone`,
  `ui-agent-team-clone`.
- ctx service property: `ctx.agentTeamsClone` (original `ctx.agentTeams`).
- Model-facing tool names: `clone_` prefix (original names unprefixed).
- `package.json`: `private: true`, `publishConfig` and upstream `repository`
  dropped; version kept at `0.2.0-rc.2` for parity traceability.
- Everything else — code paths, behavior, config defaults, locale content,
  MIT LICENSE texts — is unchanged from the original.

## Verification

Independent verification (task-4, read-only auditor): **PASS — 0 FAIL, 3 WARN, 1 INFO**.
Full log: `~/aihackerman/projects/dsh-agent-team-clone-2026-10-14/notes/verify-notes.md`

- File parity: 43/43 + 9/9 + 14/14 + 11/11, zero missing/extra per package.
- Syntax: `node --check` 23/23 pass. JSON parses 12/12 (locales + manifests).
- Cross-consistency: ctx service `agentTeamsClone` (core index.js:1704 = tools inject);
  9/9 tools `clone_`-prefixed; `TeamTaskId` export/import chain intact; projection key
  `agentTeam` on both core write (index.js:1430) and UI read (client.js:239);
  profile + root patch rows exact.
- WARNs (docs-only, no functional impact): bare tool names in profile README user docs
  (fixed post-verification); root README/cordis.patch.yml are Lead-authored extras by
  design; README.i18n.yaml content hashes inherited from the original (stale, cosmetic).
- RE engagement log and writeup: `~/aihackerman/projects/dsh-agent-team-clone-2026-10-14/`
  (steps.md, writeup.md).
