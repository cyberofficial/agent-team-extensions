# Design: The Dev Room — a visual team environment for WhaleForce

**Status:** concept design only. No code is specified as implemented.
**Owner:** WhaleForce plugin (Agent Teams subsystem).
**Applies to:** `dsh-agent-team-whaleforce-ui` (existing Team Panel) plus one new client package and one new host projection.

---

## 1. Concept

A **top-down, cutaway view of a small software studio**. Each Team member is a little developer
sitting at their own desk and PC. The room is not decoration: it is a second, ambient rendering of
the exact same durable state the Team Panel already shows — roster, tasks, turns, messages, and
reasoning — drawn as a workplace instead of a list.

The user stops watching a log and starts **watching the team work**:

- A peer message sent with `whaleforce_send_message` appears as a **speech bubble** with the actual
  words, originating from the sender's avatar and travelling to the recipient.
- While a member is producing a turn, its character **types at the keyboard** and its monitor glows.
- The model's reasoning (`reasoning` content blocks) appears as an **internal monologue thought
  bubble** — a cloud above the head, dashed, italic, visually distinct from speech.
- Tool calls animate as **props and screen changes**: a terminal window for `bash`, a code editor for
  `write`/`edit`, a browser for fetch/search, a phone for messaging.
- The shared task board is a **whiteboard of sticky notes**; claiming a task pulls a note to a desk;
  completing it turns the note green and moves it to a "done" column.
- The Lead is the **team lead with a standing desk** at the back: it walks over when it intervenes,
  but most of the time it just oversees — matching the coordinator-only model.

Everything on screen is **derived state**. The room adds no new source of truth and must never be
the only way to see or do anything.

---

## 2. Goals and non-goals

### Goals

1. **Ambient observability** — glanceable understanding of who is working, on what, and who is
   talking to whom, without reading transcripts.
2. **Faithful state** — every visual maps 1:1 to a real durable fact (member phase, turn status,
   task status, team-message, tool call, reasoning block). No fabricated activity.
3. **Choreography of coordination** — make peer-to-peer traffic visible; a room that shows the Lead
   relaying messages would be a design bug, not a feature.
4. **Cheap** — no new model tokens, negligible host cost, bounded client memory.
5. **Optional** — off by default; the Team Panel remains the primary, accessible UI.

### Non-goals

- Not a replacement for the Team Panel or the conversation view.
- Not a game: no badges, levelling, achievements, or gameplay state.
- Not a transcript viewer: bubbles are ephemeral previews, not an archive (§9).
- Not multi-team (one room = one Team root per session; §6.6).
- No 3D in v1 (a top-down 2.5D orthographic look only).

---

## 3. The scene

### 3.1 Layout (ASCII)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  WHITEBOARD (shared tasks)                       SERVER RACK (failed)    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        ▓▓               │
│  │ T-1 doing  │  │ T-2 ready  │  │ T-3 done   │        ▓▓               │
│  └────────────┘  └────────────┘  └────────────┘                          │
│                                                                          │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐         │
│   │ desk:   │      │ desk:   │      │ desk:   │      │ desk:   │         │
│   │ impl-   │      │ verify- │      │ docs-   │      │ impl-   │         │
│   │ vault   │      │ vault   │      │ writer  │      │ api     │         │
│   │  🧑‍💻    │      │  🧑‍💻    │      │  🧑‍💻    │      │  🧑‍💻    │         │
│   └─────────┘      └─────────┘      └─────────┘      └─────────┘         │
│        ↑ typing                        ↑ thinking                         │
│                                                                          │
│              ┌───────────────┐        ☕ COFFEE CORNER (idle)            │
│              │ LEAD (manager)│        🚪 DOOR (spawn / delete)          │
│              │ standing desk │                                          │
│              └───────────────┘                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Desks are assigned **once per member** in creation order, left→right, wrapping into rows; assignment
  is stable for the member's lifetime (including after a delete→restore relink) and persisted in
  client-local storage keyed by team root id so the room does not reshuffle on reload.
- The **Lead** has the standing desk at the bottom-centre; it is always present and never "walks out".
- The **whiteboard** is the task board; the **server rack** is the failed/deleted wall; the **door** is
  where members spawn, walk out on delete, and return on restore; the **coffee corner** is the idle
  zone (a member may physically walk there when `inactive` for > N seconds in "cozy" mode).
- **Meeting corner** (optional, M3): two characters stand together while exchanging a message burst,
  so a long peer conversation reads as a real huddle.

### 3.2 Camera

| Control | Behaviour |
|---|---|
| Ambient mode | Fixed wide shot, whole room visible. Default. |
| Focus mode | Click a member → camera pans/zooms to that desk; other desks dim. |
| Zoom | Mouse wheel / pinch: 0.6× (floor plan) → 1× → 2.5× (desk detail). |
| Pan | Drag empty floor; double-click empty floor to recentre. |
| Mini-map | Optional corner overlay for rooms > 8 members or when zoomed in. |
| Replay | Scrub bar over the last N minutes of activity ("rewind the room"), M3 stretch. |

---

## 4. Characters and states

### 4.1 Character model

Each member renders as a small vector character (procedural SVG, §7.2) with:
`body hue` derived from a stable hash of the member name (never used for status meaning),
`name tag` above the head, `model badge` on the monitor, and a `status lamp` on the desk.

### 4.2 State machine (derived, not invented)

Every state below maps to a real fact. Priority order: `failed` > `provisioning` > `deleted` >
`running` > `waiting(msg)` > `blocked` > `idle`.

| Visual state | Source fact | Pose / animation |
|---|---|---|
| `provisioning` | member phase `provisioning` | Materialising at the door: walk in, outline fading to solid. |
| `active-idle` | phase `active`, agent `inactive`, no unread mail, no ready claim | Sits, monitor screensaver, occasional idle blink. |
| `active-typing` | agent `running` and no active tool call | Leans forward, hands type, monitor shows text stream, keyboard clacks (motion only). |
| `active-thinking` | agent `running`, reasoning content arriving, no tool call yet | Leans back, chin-scratch, **thought cloud** visible. |
| `active-tool` | agent `running`, active tool call | Works with the tool prop; monitor shows tool icon/label (§5.2). |
| `waiting-peer` | member has sent a message and is idle awaiting reply (heuristic: idle + last own act is a `send_message` tool call, < 60 s) | Looks toward the recipient's desk, slight tap. |
| `blocked` | owned task has uncompleted `blockedBy`, or `TEAM_TASK_BLOCKED` report | Holds a "waiting" sign; red dashed line to the blocker's desk. |
| `failed` | member phase `failed` | Slumped at desk, red lamp, diagnostic hover card. |
| `deleted` | phase `deleted` | Walks out the door; desk empties; name plate greyed in a side roster. |
| `restored` | `deleted → active` transition event | Walks back in from the door and sits; context intact. |

Transitions are animated, not instant: 200–400 ms walk, 150 ms pose change; a status change must be
readable at a glance without reading text.

### 4.3 Lead character

The Lead renders at the standing desk. Its default pose is **overseeing** (slow scan of the room).
It does not mirror every event — only its own turns and messages. When the Lead messages a member,
it walks to that desk, speaks, and returns (visualising the coordinator-only behaviour). When the
Lead is idle while the team runs, it stands still and reads the room — this is the correct picture of
an autonomous team.

---

## 5. Event choreography

### 5.1 Speech bubbles (peer messages)

Trigger: a delivered mailbox message (`team/message/delivered`, and the target session's
`user/message` event whose `source.kind === "team-message"` with `senderName` + `messageId`).

```text
        ┌───────────────────────────────┐
        │ @impl-vault:                  │
        │ tag mismatch on .1 — sending  │
        │ you the corrupt-log path      │
        └───────────────┬───────────────┘
                        │  (tail points at SPEAKER)
                     🧑‍💻 impl-vault  →  walks 2 tiles to verify-vault
```

Rules:

- **Attribution:** bubble belongs to the **sender**; the speaker turns toward the recipient and a
  short dotted "voice line" connects them. The recipient gets a small "heard it" icon (ear) when the
  message lands in its session.
- **Content:** the message text, trimmed to the first 140 chars with an ellipsis; click expands the
  full message in a side peek. Newlines collapse to spaces in the bubble; the expanded peek keeps
  formatting.
- **Durability:** a bubble is a preview with a TTL (default 10 s, then fades). It never replaces the
  message in the member's conversation. Messages are already durable; the bubble is not a log.
- **Burst coalescing:** if a member sends > 2 messages in 5 s, the third+ collapses into
  "3 more messages →" instead of stacking. Never more than 3 bubbles per speaker on screen.
- **Queue/undelivered:** `queued` messages show a paper-plane icon travelling with a dashed trail
  until delivered, then the bubble pops. `queued` is already durable — the icon is not a retry.
- **Lead→human:** the Lead's final answer is never bubbled in the room (it belongs in chat), only
  Lead→member traffic.

### 5.2 Thought clouds (internal monologue)

Trigger: assistant `reasoning` content blocks / `reasoning-delta` stream chunks for the member's
session.

```text
                    .-················-.
                 .·'   hmm, the tag is      '·.
                (     checked before the      )
                 '·.   ciphertext is read  .·'
                    '-················-'
                           🧑‍💻  (thinking)
```

Rules:

- **Visual distinction:** dashed cloud, italic, muted colour, smaller max width; never mistaken for
  speech. Speech = solid bubble with a tail; thought = dashed cloud with three ascending dots.
- **Streaming:** text types into the cloud in order as deltas arrive, capped at 160 chars on screen
  (the full reasoning remains in the conversation view if the harness exposes it).
- **Privacy default:** thoughts are **opt-in** (config `showThoughts: false` by default). When off,
  the member still shows the *thinking pose* and an empty animated cloud — you see that it is
  thinking, not what it thinks. This is the safe default for screen-sharing.
- **Redaction:** the projection never carries thoughts for models/routes that do not expose
  reasoning; tool arguments are never shown inside a thought (§9).

### 5.3 Tool activity (props and monitors)

Trigger: active tool call in the member's turn.

| Tool family | Prop / animation | Monitor shows |
|---|---|---|
| `bash` | Terminal window at the desk; cursor blinking | `$ <command head, 40 chars>` |
| `read` / `grep` / `glob` | Filing cabinet drawer opens; paper flips | file/path name |
| `write` / `edit` | Code editor prop; typing sparks | filename + diff stat (`+12 −3`) |
| `whaleforce_send_message` | Telephone / paper plane; speaker turns to peer | recipient name |
| `whaleforce_team_task_*` | Sticky note moves between desk and whiteboard | `task-3 → in_progress` |
| `whaleforce_wait_agent` | Hourglass | "waiting…" |
| `whaleforce_spawn_teammate` | Door opens, new character walks in | `+1 member` |
| `whaleforce_delete_teammate` | Character walks out, desk empties | `−1 member` |
| `whaleforce_set_teammate_model` | Monitor switches theme/refresh | `model: <id>` |

The monitor is a **read-only summary**: tool name plus a ≤40-char argument head. Raw arguments and
tool output never render in the room (§9).

### 5.4 Tasks (whiteboard)

- A sticky note is one non-deleted task: `subject`, owner initials, status colour
  (`pending` grey, `in_progress` amber, `completed` green, `blocked` red ring).
- `pending` + `ready` notes pulse gently; a note's owner initials appear when claimed.
- `blocked_by` edges draw as thin red strings between notes; hovering a note highlights its chain.
- Completing a task flips the note and plays a one-shot stamp; the "done" column keeps the last N.
- Click a note → opens the Team Panel's task view (existing panel, focused on that task).

### 5.5 Status and lifecycle

| Event | Choreography |
|---|---|
| Spawned | Door opens; character walks to assigned desk; name plate appears. |
| Provisioning failure | Character stops at the door, turns grey, walks back out; rack lamp blinks. |
| Interrupted | Character freezes mid-pose for a beat, then resumes idle; monitor shows `interrupted`. |
| Model/effort swap | Monitor flickers to the new model badge; a small tag rises (`effort: max → low`). |
| Member deleted | Character walks out; desk dims; name plate greys. |
| Member restored | Character walks back in and sits; a small "context intact" icon on the monitor. |
| Team disposed / root closed | Lights dim to blue; room enters "after hours" state. |

---

## 6. Data architecture

### 6.1 What exists today (reuse, do not duplicate)

| Data | Where the client already reads it |
|---|---|
| Roster + tasks | `projectionsBySession[leadId].values.agentTeam` (projection key `agentTeam`, wire view = roster + non-deleted tasks) |
| Direct-child identity + labels | `projectionsBySession[leadId].values.subagentCatalog` |
| Session running state, origin, blank | `useSessions(state => state.byId)` |
| Per-member model selection (incl. pending swaps) | `projectionsBySession[memberId].values.modelSelection` |
| Conversation messages (incl. reasoning blocks) | `useConversation` for the member session |
| Peer message attribution | target session's `user/message` event `source.kind === "team-message"` → `{ senderName, messageId }` |
| Model catalog + efforts | existing RPC `/api/plugins/whaleforce/model-catalog` |

### 6.2 New: one bounded projection per member session — `agentTeamRoom`

A **projection**, not an RPC poll. Projections are derived from a session's own durable log, so they
replay correctly on reload, stream through the existing client store with no new transport, and are
privacy-filtered on the host.

Register in the core plugin (`agent-team`, next to `teamProjectionDefinition`):

```text
key: "agentTeamRoom"        stateVersion: 1
init(header) → { version: 1, activity: [], lastSpeech: undefined,
                 lastThought: undefined, activeTool: undefined, sent: [] }
apply(state, event):
  user/message with source.kind === "team-message"
      → push { id: source.messageId, kind: "speech-in",
               from: source.senderName, text: trim(content, 240), at: seq }
      (the projection folds the *received* message; the sender's own outgoing
       bubble is derived from its send tool call, §6.3)
  assistant message content block type === "reasoning"
      → lastThought = { text: trim(block.text, 240), at: seq }   // always bounded
  tool call started  → activeTool = { name, argHead: trim(argHead, 60), callId }
  tool call ended    → activeTool = undefined; activity push { kind: "tool", name, ok }
  turn start/end     → activity push { kind: "turn" }
wire.view(state) → last 16 activity entries + lastSpeech + lastThought + activeTool
```

Design constraints:

1. **Bounded**: ring buffers only (16 events, 240 chars/snippet, 60 chars/arg head). The projection is
   never a transcript and never grows with session length.
2. **No secret spill**: only *names* and *trimmed heads*; never tool results, never file contents,
   never message bodies beyond 240 chars, and no raw reasoning when `showThoughts` is off (the host
   checks the plugin config at fold time — a projection must not produce data the client is not
   allowed to show).
3. **Cheap fold**: O(1) per event; no allocation when nothing display-relevant changes (the existing
   `agentTeam` projection already demonstrates the reference-reuse trick). Cost target < 0.1 ms per
   event.
4. **Replay-safe**: the projection is deterministic from the log; reloading the page rebuilds the same
   room state without host memory.

### 6.3 Deriving "who is talking to whom"

Both sides of a message are observable, so the room can animate a real exchange:

- **Sender side:** the `whaleforce_send_message` tool call in the sender's session gives `target` and
  the message text head → render outgoing bubble immediately, keyed by the tool `callId`.
- **Receiver side:** the `team-message` user message gives `senderName` + `messageId` → render the
  incoming bubble and mark the recipient's "heard" icon.
- **Unification:** when the receiver's projection reports the same text/burst, the outgoing and
  incoming visuals merge into one speech act travelling from sender desk to recipient desk. No
  messageId on the sender side is fine — correlate by `target` + time window (≤2 s) and fall back to
  two independent bubbles rather than guessing wrong.

### 6.4 Scene assembly (client)

```text
roomState = merge(
  agentTeam view            → members[], tasks[]
  subagentCatalog view      → child ids (excludes Lead)
  member room projections   → per-member activity
  session summaries         → running/blank/origin
  modelSelection projection → model + pending effort
)
→ assignDesks(memberIds)    // stable, local-storage keyed by team root id
→ reduceVisualState(member) // §4.2 priority machine
→ choreograph(event queue)  // §5, animated with TTLs
```

The reducer is a pure function and fully unit-testable with synthetic projections — the scene itself
can be smoke-tested headlessly by snapshotting the reducer's output for a scripted event sequence.

### 6.5 Latency and coalescing

- Projection updates arrive on the existing live stream; target **≤ 250 ms** from event to animation.
- The client batches per animation frame; multiple deltas within a frame coalesce (one bubble update,
  not one per token).
- Bubbles have TTL (10 s default), hard cap 6 concurrent, hard cap 3 per speaker (§5.1).
- When the tab is hidden, animations pause and the event queue drains to latest-only; on return, the
  room shows current state plus a "while you were away" summary (last 3 events), never a replay storm.

### 6.6 Multiple teams / sessions

One room renders **one Team root** — the Team of the currently open Lead session. Switching
conversations switches rooms. Teams never share a scene. `client-ui-agent-team-sessions` remains the
catalog of all subagent sessions; the room is the spatial view of one team at a time.

---

## 7. Rendering approach

### 7.1 Canvas vs DOM

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Pure DOM + CSS transforms | Accessible text bubbles, easy theming, no asset pipeline, debuggable | Many animated nodes at 2.5× zoom | **v1** — rooms are ≤ 8–12 members by design |
| Canvas 2D | Cheap many-sprites, easy camera | Text quality, a11y, hit-testing work | v2 if rosters grow |
| WebGL | Nicest effects | Overkill | No |

**Recommendation:** v1 = one absolutely-positioned `<div>` scene with CSS `transform: translate/scale`
for the camera; characters and props are inline SVG; bubbles are real DOM text (crisp, selectable,
screen-reader reachable). Promote hot paths to canvas only if profiling demands it.

### 7.2 Asset strategy

- **Characters:** procedural SVG (rounded body, head, hair variant, palette from name hash). No image
  files required — keeps the package self-contained and theme-aware.
- **Props:** inline SVG (desk, monitor, whiteboard, coffee, door, rack). Tool props are layered on the
  desk and swapped by a single class/`<use>` reference.
- **Animations:** CSS keyframes + a small requestAnimationFrame ticker for walk paths and bubble
  physics. No animation library.
- **Theming:** use the existing DSH CSS custom properties (`--dsw-alias-*`) so the room matches the
  host theme (light/dark) with zero bespoke palettes; a small "studio" palette layer for floor/desk
  materials derived from those tokens.
- **Optional sprite pack:** later, allow `spritePack: "emoji" | "svg"` config; emoji mode is a
  zero-asset fallback.

### 7.3 Animation budget

- 60 fps target, 30 fps floor; `prefers-reduced-motion` → no walking, no typing motion, bubbles fade
  only (state still readable via poses/icons).
- Max 6 concurrent bubbles, 1 thought cloud per thinking member, 12 animated characters.
- Hidden tab → zero rAF work.
- Long-list safety: bubbles are keyed by id and removed on TTL; no unbounded arrays in React state.

---

## 8. Interaction

| Input | Result |
|---|---|
| Hover character | Member card: name, target, status, model, effort, current tool, current task, last message line. |
| Hover monitor | Tool detail: name + arg head (never output). |
| Click character | Focus mode + "Open conversation" button → existing `openTeammate`/`openChild` flow. |
| Click desk name plate | Same member card pinned. |
| Click sticky note | Opens Team Panel focused on that task (existing panel/task view). |
| Click whiteboard header | Team Panel task board. |
| Drag empty floor | Pan; wheel = zoom; `F` = fit room; `L` = focus Lead. |
| Right-click character (Lead only) | Menu: Interrupt / Swap model / Delete (destructive actions open a confirm with the same warnings as the tool descriptions). |
| Speech bubble | Click → side peek with full message + "open sender/recipient chat". |
| Thought cloud | Click → only if `showThoughts`; opens member conversation scrolled to reasoning (if the harness renders it). |
| Keyboard | `Tab` cycles members; `Enter` opens card; arrows pan; `Esc` exits focus. Room is fully operable without a mouse. |

The room is a **view + light remote control**. All destructive actions require confirmation
(reuse the existing model-swap route for swaps; interrupt/delete go through the existing client
actions and remain Lead-only, enforced host-side).

---

## 9. Privacy and safety

The room is glanceable by design, which makes accidental disclosure the main risk.

1. **Thoughts are opt-in** (`showThoughts: false` default). Off = poses and an empty cloud only. The
   projection itself is folded with a redaction flag, so a misconfigured client cannot reveal what
   the host did not send.
2. **Never render tool output, file contents, tool arguments beyond a 60-char head, or full message
   bodies** in the room. Full content stays in the conversation where it belongs.
3. **Bubbles are transient**: TTL ≤ 30 s, not persisted, cleared on navigation. They are not an
   audit trail; the durable record is the mailbox/session log.
4. **Screenshot mode** (setting): hides thoughts, hides bubbles, shows only room state and tasks.
5. **Redaction of common secret patterns** in any rendered head (paths with `*_API_KEY`, `token`,
   `secret`, `password`) before display; belt-and-braces, not the only defence.
6. Default **off** in the profile bundle; enabled per user via the plugin's config.

---

## 10. Performance budget

| Metric | Budget |
|---|---|
| Host fold cost | < 0.1 ms per session event; no extra journal writes |
| Projection payload | < 2 KB per member view; < 24 KB for a 12-member room |
| Client frame | < 8 ms at 1× zoom on a 2020-era laptop |
| Memory | < 25 MB incremental for the room view |
| Idle CPU | ~0 (no rAF when no events, hidden tab fully paused) |
| Event→pixel | ≤ 250 ms |
| Bundle size | ≤ 60 KB gzipped added to the client chunk |

---

## 11. Accessibility and i18n

- Every visual fact has a text equivalent: focusable characters with `aria-label`
  (`"impl-vault, running, bash, task-3"`), task notes as a list, and a polite live region that
  announces at most one summary per 5 s (`"verify-vault sent a message to impl-vault"`), never raw
  reasoning.
- `prefers-reduced-motion` respected (§7.3); a "static room" mode draws state without motion.
- Status is never colour-only: icons + poses + text in the card (colour-blind safe).
- All strings through the existing locale mechanism (`locale/en.json`, `locale/zh.json`) with keys
  added under the `room.*` namespace.
- The room can be collapsed to a strip ("minimap only") for users who only want the Team Panel.

---

## 12. Configuration (new package)

```yaml
- id: ui-agent-team-room
  name: 'dsh-agent-team-whaleforce-room'
  config:
    enabled: true            # off by default in the bundle
    mode: ambient            # ambient | compact | hidden
    showThoughts: false      # thought clouds render empty when false
    bubbleTtlMs: 10000       # 3000..30000
    maxBubbles: 6            # 1..12
    characterStyle: svg      # svg | emoji
    idleWander: true         # walk to coffee corner when idle > 90 s
    sound: false             # off by default; subtle typing/clack if enabled
    camera: wide             # wide | follow-lead
    redactHeads: true        # strip secret-looking substrings from tool arg heads
    spritePack: default      # future: custom pack id
```

`enabled` is read by the host (projection fold + client load) so a disabled room costs nothing.

---

## 13. Packaging and file plan (design-level)

| Piece | Where | Change |
|---|---|---|
| Room projection `agentTeamRoom` | `packages/agent-team/lib` (core) | Add projection definition + register; bounded fold; redaction flag from config |
| Room scene package (new) | `packages/client-ui-agent-team-room` | `dsh-agent-team-whaleforce-room`; `dsh.client` platform web; entry `lib/index.js` (host half, empty apply) + `lib/client.js` (scene) |
| Bundle wiring | `packages/agent-team-profile/cordis.patch.yml` | Insert `ui-agent-team-whaleforce-room` row after the sessions row; keep Team Panel |
| Slots | client | Register a `conversation.session` / workspace slot (same mechanism the sessions UI uses) or a dedicated workspace view; mount room beside the Team Panel |
| Scene modules | new package `src/client/room/` | `layout.ts`, `characters.ts`, `choreography.ts` (reducer), `bubbles.tsx`, `whiteboard.tsx`, `assets.ts`, `Room.module.css` |
| i18n | both UI packages | `locale/{en,zh}.json` `room.*` keys |
| Tests | new package `test/` | reducer unit tests over synthetic projection sequences; bubble TTL/cap tests; a11y snapshot; visual smoke via the client test runtime |
| Docs | this file + tool README cross-link | Mark experimental |

Suggested build order mirrors the milestones below; the projection can ship before any pixels.

---

## 14. Phased rollout

| Phase | Deliverable | Proves |
|---|---|---|
| **M0 — feed** | `agentTeamRoom` projection + reducer + headless tests (no pixels) | Data is faithful, bounded, redacted, cheap |
| **M1 — static room** | Layout, desks, characters, whiteboard, status lamps; real roster/tasks only; no animations | The space reads correctly at a glance |
| **M2 — live choreography** | Typing/thinking poses, thought clouds (opt-in), tool props, speech bubbles, task note motion | The team's coordination is legible |
| **M3 — interaction** | Member cards, focus/zoom, open-chat, task jump, Lead-only menu, settings, a11y | The room is usable, not just pretty |
| **M4 — polish** | Meeting corner, replay scrubber, sprite packs, sound, minimap, compact strip | Delight without cost |

Each phase is independently shippable and disabled by default until M3.

**Risk check:** the projection/reducer (M0) is the only part with real uncertainty; the visuals are
incremental. If M0 slips, nothing else starts.

---

## 15. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Projection adds host cost or log noise | Latency/CPU regression | Bounded O(1) fold, no journal writes; benchmark gate in M0 |
| Moments of "fake" motion (heuristics like `waiting-peer`) read as truth | Trust loss | Every heuristic is visually distinct and documented; default to real facts only |
| Reasoning content leaks in screenshots | Privacy incident | Opt-in + host-side redaction + screenshot mode |
| Many members make the room noisy | Uselessness | Cap bubbles, meeting corner, mini-map, focus mode; soft roster target already ~8 |
| Reimplementing state the Team Panel owns | Drift | Room reads projections only; all actions delegate to existing flows |
| Animation jank on low-end machines | Poor experience | CSS transform-only animation, reduced-motion, hidden-tab pause, v2 canvas escape hatch |
| Long-running team in one room becomes visually static | Boredom | Ambient micro-motion (idle blink, monitor shimmer), "while you were away" recap, replay scrubber |

---

## 16. Open questions

1. **Where does the room mount?** Workspace view tab, a right-sidebar panel, or a `conversation.session`
   slot replacing the chat? Recommendation: a workspace view tab in M1, embeddable later.
2. **Should thoughts be on by default for local models?** Current recommendation: no; opt-in only.
3. **Do we need per-member "desk notes"** (the member's current `task.subject`) always visible, or on
   hover? Recommendation: on hover at 1×, always at 2.5×.
4. **Replay**: is a scrubber worth the complexity, or is "while you were away" enough? Defer to M4.
5. **Multiple concurrent browsers**: projections keep them coherent for free; verify the TTL/queue
   behaviour does not conflict (each tab owns its own transient bubbles).

---

## 17. Success criteria

- A user watching a 6-member team for 30 seconds can answer: who is working, what each is doing
  (tool/task), who is talking to whom, and what is blocked — **without opening a single chat**.
- Zero new model tokens; < 60 KB added to the client; < 8 ms frame at 1×.
- A screen-share of the room with `showThoughts: false` leaks no message bodies and no tool output.
- The Team Panel remains fully sufficient; disabling the room removes its entire cost.
