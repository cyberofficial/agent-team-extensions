---
description: "Twelve tools that let the model create, message, coordinate, delete and restore teammates, and swap their models, for compositions mounting the WhaleForce Agent Teams plugins."
kind: "package-reference"
---

# dsh-agent-team-whaleforce-tools

Cloned from @deepseek-ai/dsh-experimental-tool-agent-team v0.2.0-rc.2 (MIT).

English | [中文](README.zh.md)

## Summary

This package lets the model create named teammates, send them messages, inspect availability, wait for progress, interrupt stuck work, and coordinate through a shared task board. Every team member receives the same twelve tools and guidance for coordinating in a shared workspace. Choose it when the model should operate a team only after you explicitly request one. Every tool is renamed with a `whaleforce_` prefix, so this package coexists with the legacy subagent controls and the original team tools instead of shadowing them. This is a private rebrand of the experimental package and provides no stability guarantee.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Add this package on top of `dsh-agent-team-whaleforce-core` when the model should run a team through tools. Once mounted, every team member - the Lead and each teammate - gets the same twelve tools plus the same coordination policy. `whaleforce_spawn_teammate` prefixes the initial task with the teammate’s role and name.

### When to choose it

Choose it when the model should create and coordinate teammates by itself rather than a human driving subagent controls. Because every tool name carries the `whaleforce_` prefix, the legacy global subagent tools and the original team tools keep working: this package registers under distinct names instead of shadowing them. The fixed policy creates teammates only when you explicitly ask for a team or teammates, so ordinary tasks never trigger delegation on their own.

### Smallest working example

The smallest addition to an existing composition is the two-package fragment from the dsh-agent-team-whaleforce-core package README (its "smallest working setup" section): durable session storage, the WhaleForce team domain package, and this package. The plugin itself takes two optional settings:

```yaml
- id: tool-agent-team-whaleforce
  name: 'dsh-agent-team-whaleforce-tools'
  config:
    freshProvider: spawn
    forkProvider: fork
```

| Field | Default | Meaning |
|---|---|---|
| `freshProvider` | `spawn` | Provider that starts fresh teammates |
| `forkProvider` | `fork` | Provider that starts fork teammates |

The generated [configuration catalog](../../../docs/config-catalog.md#dsh-agent-team-whaleforce-tools) is the exhaustive source for every accepted field and its JSDoc.

Try it by asking the Lead model: "create a teammate named reviewer to check the diff, then send reviewer the change summary". The model calls the creation tool and then the messaging tool.

### What the model can do

The twelve tools group into seven capabilities:

- **Create a teammate** - `whaleforce_spawn_teammate` takes a name, a description, the initial task, an optional model, an optional `provider` route that owns it, and an optional `effort` (reasoning effort id); only the Lead can call it. The model is resolved and validated at call time exactly like `whaleforce_set_teammate_model`: the explicit `provider` wins when it serves the model, else the Lead's provider, else the single serving provider, and an unavailable or ambiguous route fails immediately with `TEAM_MODEL_UNAVAILABLE` instead of burning the name. An explicit `effort` must be one the resolved route advertises (the model catalog lists them; omitted means the route default), and an unsupported id fails the same way. An effort-only spawn reuses the Lead's own model route at a different effort. The validated route reaches the child as per-child agentOptions: it requires a spawn provider that accepts them, and ACP-backed teams reject a model-carrying spawn.
- **Send messages** - `whaleforce_send_message` steers a running member at its nearest step boundary, starts or resumes an inactive member.
- **See and wait** - `whaleforce_list_agents` returns each member’s `target` and availability; `whaleforce_wait_agent` waits for the next team change; `whaleforce_interrupt_agent` stops a teammate's current turn (Lead only).
- **Manage the task board** - `whaleforce_team_task_create`, `whaleforce_team_task_list`, `whaleforce_team_task_get`, and `whaleforce_team_task_update` add, browse, read, and update shared tasks.
- **Delete and restore a teammate** - `whaleforce_delete_teammate` durably removes one teammate: its live agent stops, its roster row disappears, and its in-progress tasks return to pending; the name is consumed forever by a new spawn. `whaleforce_restore_teammate` relinks one deleted teammate from its durable child session: the roster row returns as active under its original name with its full history, its next message resumes it, no new slot or name is spent, and the released tasks are not reclaimed. Omitting `target` lists deleted teammates and whether their sessions remain. Both are Lead only.
- **Swap a teammate's model or effort** - `whaleforce_set_teammate_model` changes one teammate's model and/or reasoning effort for its next turn (Lead only). A step already in flight keeps its current model. An inactive teammate also accepts the swap: the selection is stored durably in its session log and applied when it next activates. The model may come from any provider in the configured catalog: the optional `provider` parameter wins when it serves the model; without it, the teammate's own provider is preferred and the single other provider serving the model is used next. A model served by several providers without an explicit choice, and an unavailable model, both fail with `TEAM_MODEL_UNAVAILABLE`, naming the serving providers. The optional `effort` is validated against the resolved route's advertised efforts, so an effort-only swap keeps the model and changes its reasoning level.
- **Recover a dead model route** - a teammate's model route is frozen at spawn, so when the backing API dies, resuming that teammate keeps failing on the same dead route. Recovery today is `whaleforce_delete_teammate` plus a respawn with the `model` parameter set to the new route's model id in provider-owned form (for example `z-ai/glm-5.3-flash`; a provider-prefixed id such as `nvidia/z-ai/...` is rejected at spawn), or with the `model` plus the matching `provider` parameter when the Lead's provider does not serve the id (for example `cat-jam-free` on `opencode-go`). Once the cold-swap support in this build is loaded (after a server restart), `whaleforce_set_teammate_model` on the inactive member is the recovery instead: swap, then resume, keeping the roster slot and name.

Creation and listing results identify members by `target`, with no member Session ID. Use that value in message and interrupt calls or the task tools’ `owner` parameter; task `ownerName` uses the same value. `inactive` means no turn is executing, whether the member is loaded or must be resumed; it does not describe task completion or outcome. `provisioning` and `failed` describe member creation. Any member can message any other member and use the task board; only the Lead creates, interrupts, deletes, restores teammates, and swaps their models. Task updates keep the domain's owner and revision checks, so an outdated edit is rejected instead of overwriting newer work.

### What success and failure look like

Sending a message succeeds as soon as it is safely stored: the result is `accepted` (delivered now) or `queued` (waiting), and a queued message must not be resent. `whaleforce_wait_agent` returns `noProgress` right away when no other member is running or provisioning, telling the caller to wake a teammate first; otherwise it waits for the next change and the caller re-reads state afterward. Task edits based on an outdated revision are rejected rather than overwriting newer work.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals - click to expand</summary>

This section explains the design decisions behind the adapter and points at the code that realizes them; the observable behavior is fully covered in [Use this package](#use-this-package).

### Design philosophy

The adapter is built on three commitments:

- **Scoped, not global.** Every registration lives on the member Agent's own `ctx`; installation uses the member identity available when the Agent is published.
- **Declared results, compact JSON.** Every tool declares its complete result schema and renders that value as compact JSON, so the compiler checks `execute` against what the model is promised and no result spends tokens on indentation.
- **The domain owns authority.** Tools delegate to `ctx.agentTeamsClone`, which enforces Lead authority and revision checks; the adapter adds no weaker path.

The [Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.md) owns the model-facing and scoping decisions.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry: config, the fixed policy text, and the twelve scoped tool registrations |
| - | No runtime invariant companion is published; the Team service owns durable and authorization relations. |

### Policy and tools

One `whaleforce-team:policy` section on the member scope states the shared coordination rules; the fixed text and the twelve tool registrations are declared in [`src/index.ts`](src/index.ts). The twelve tool schemas are registered in scopes recognized as Team members at publication. Scoped registrations use `whaleforce_`-prefixed names, so they never shadow the legacy global continuable-subagent controls.

### Scoped registration and teardown

`maybeInstall` runs for every live Agent and subscribes to `agent/created`; it skips Agents without Team membership. Disposal of an Agent runs the installed disposer, and plugin HMR disposes every installed scope before reinstall. Each disposer unwinds registrations in reverse order, so a failed install cannot leave a partial scope.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the package-level contract is not enough. They move from the domain service to the exact schemas and the decisions behind the design.

- dsh-agent-team-whaleforce-core package - the `ctx.agentTeamsClone` domain service behind these tools.
- [Agent Teams subsystem](../../../docs/subsystems/agent-team.md) - durable Team types and service API.
- [Generated tool catalog](../../../docs/tool-catalog.md#dsh-agent-team-whaleforce-tools) - every tool schema the model receives.
- [Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.md) - model-facing, scoping, and isolation decisions.

-----

<a id="model-experience"></a>
## Model Experience

### Team policy and tools

#### What the model sees

One shared system policy states the explicit-delegation requirement, shared-cwd behavior, filesystem stale-version recovery, Bash/formatter/codegen risk, task and write-scope coordination, Steer delivery, the no-retry mailbox rule, and the Lead's duty to wait before answering. All twelve Team schemas are identical for Leads and teammates; execution enforces Lead-only operations. `whaleforce_spawn_teammate` prefixes its initial user message with `<system-reminder>\nYou are teammate "<name>".\nYour Team Lead is named "lead".\nUse whaleforce_list_agents({}) to find your teammates and their names.\nTo message your Team Lead, use whaleforce_send_message({ target: "lead", message: "..." }).\nTo message another teammate, use whaleforce_send_message({ target: "<teammate name>", message: "..." }).\n</system-reminder>`, followed by a blank line and the task. The prefix contains no Team id and works when runtime context is disabled. Forks inherit history without an additional Lead identity message.

#### Token effect

Fixed policy and schema cost on every Team member request. The initial identity text follows ordinary history through later steps, cold recovery, and compaction; the plugin neither scans for it nor reinserts it. Tool calls add compact JSON roster, task, wait, or receipt results. Peer content is retained by the Team domain in the target's history. The first request after a `whaleforce_set_teammate_model` swap re-pays input tokens on the new model.

#### KV Cache effect

With the same provider/model, shared system policy, and tool schemas, a fork retains the parent request prefix and appends the initial task with its identity prefix. Tool results and peer messages append after the reusable request prefix. Sessions recorded with identity inside the system prompt can change that prefix on their first request under this layout; actual provider cache hits remain best-effort.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **One-shot child tool visibility** - in-process one-shot children receive their subagent descriptor after publication. Team installation can therefore mistake them for Leads and expose Team policy and tools. Calls are rejected once the descriptor identifies them as non-members. Correcting installation timing is deferred.

These limits describe what the policy and tools cannot guarantee for a team. They are current package constraints, not a comparison with other collaboration surfaces.

- **Prompt policy is coordination, not confinement** - it cannot stop Bash or external processes from writing overlapping files.
- **No autonomous team creation** - ordinary tasks do not trigger delegation unless the user explicitly requests it.
- **No Web controls** - browser roster and task-board presentation is outside this runtime package.
- **Experimental prototype with no stability promise** - this is a private rebrand of a public experimental package; its schemas can change freely while it incubates.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers - click to expand</summary>

None.

</details>
