import z from "@deepseek-ai/schemastery";
import { TeamTaskId } from "dsh-agent-team-whaleforce-core";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region lib/types/index.js
/** Scoped model-facing tools for the opt-in Agent Teams runtime. */
/** Cordis plugin name. */
const name = "tool-agent-team-whaleforce";
/** Services required by the Team tool plugin. */
const inject = [
	"agents",
	"agentTeamsClone",
	"tools",
	"systemPrompt"
];
/** Loader schema for the opt-in Team tool plugin. */
const Config = z.object({
	freshProvider: z.string().default("spawn"),
	forkProvider: z.string().default("fork")
});
/** Model-facing collaboration guidance shared by Lead and teammates. */
const POLICY = `Agent Teams is available in this session, but create teammates only when the user explicitly asks to use Agent Teams or teammates.

The Team Lead and all teammates share the same working directory and filesystem. Edits are immediately visible to every member. Split write work into disjoint scopes, record expected write scopes on shared tasks, and use task dependencies when work must be ordered. Write-scope overlap is advisory, not a lock.

Prefer read/edit/write for file changes. If a file operation returns FS_STALE_VERSION, read the current file, rebase your intended change onto the new content, and retry. Bash, formatters, code generators, and scripts are not fully protected by the filesystem version guard; coordinate them explicitly and have the Lead review the final diff and run tests.

Use the target returned by whaleforce_spawn_teammate or whaleforce_list_agents for whaleforce_send_message and whaleforce_interrupt_agent, or as owner when assigning or filtering shared tasks. whaleforce_send_message steers a running target at its nearest step boundary and starts or resumes an inactive target. inactive means no turn is executing; it does not describe task completion, success, failure, or waiting for other agents. provisioning means member creation is in progress; failed means member creation failed. A delivered peer item starts with its stable message id and sender name. A successful send is already durable even when its result says queued; do not resend it. Shared-task workflow is list, get, claim with the current revision, perform the work, then complete. Task readiness never starts an owner. Before whaleforce_wait_agent, use whaleforce_list_agents and make sure another required member is running or provisioning; use whaleforce_send_message first when the required member is inactive. whaleforce_wait_agent observes only changes after that call starts, never wakes a member, and returns noProgress immediately when no other member can produce a change. Re-list after wakeup or timeout. The Lead must wait for required teammates before giving the final answer. The whaleforce_delete_teammate tool is a Lead-only extension for durable teammate deletion. The whaleforce_set_teammate_model tool is a Lead-only extension that changes one teammate's model from its next turn; a step already in flight keeps its current model. It also accepts a swap for an inactive teammate: the selection is stored durably and applied when the teammate next activates. The model may come from any provider in the configured catalog; pass the provider explicitly when several providers serve the same model id.`;
const ACTIVE_WAIT_STATUSES = new Set(["running", "provisioning"]);
const NO_ACTIVE_PEER_MESSAGE = "No other Team member is running or provisioning. whaleforce_wait_agent cannot make progress or wake inactive teammates. Re-list with whaleforce_list_agents and whaleforce_team_task_list, then use whaleforce_send_message to wake each required inactive teammate before waiting again.";
/**
* One model-facing roster row. The Lead pseudo-row omits the
* teammate-only provisioning fields, so only identity, role, status, and
* diagnostics are required.
*/
const MEMBER_VIEW_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		target: {
			type: "string",
			required: true
		},
		role: {
			type: "string",
			required: true,
			enum: ["lead", "teammate"]
		},
		status: {
			type: "string",
			required: true,
			enum: [
				"running",
				"inactive",
				"provisioning",
				"failed"
			]
		},
		description: { type: "string" },
		provider: { type: "string" },
		context: {
			type: "string",
			enum: ["fresh", "fork"]
		},
		model: { type: "string" },
		diagnostics: {
			type: "array",
			required: true,
			items: { type: "string" }
		}
	}
};
/** Expose the member name as its model-facing target. */
function modelMember(member) {
	const { id: _id, name, ...details } = member;
	return {
		target: name,
		...details
	};
}
/** One shared task, matching the public `TeamTaskView`. */
const TASK_VIEW_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		id: {
			type: "string",
			required: true
		},
		revision: {
			type: "integer",
			required: true
		},
		subject: {
			type: "string",
			required: true
		},
		description: {
			type: "string",
			required: true
		},
		status: {
			type: "string",
			required: true,
			enum: [
				"pending",
				"in_progress",
				"completed",
				"deleted"
			]
		},
		ownerName: { type: "string" },
		blockedBy: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		writeScopes: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		ready: {
			type: "boolean",
			required: true
		},
		writeScopeWarnings: {
			type: "array",
			required: true,
			items: { type: "string" }
		}
	}
};
const SPAWN_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: { member: {
		...MEMBER_VIEW_SCHEMA,
		required: true
	} }
};
const MEMBER_LIST_VALUE_SCHEMA = {
	type: "array",
	items: MEMBER_VIEW_SCHEMA
};
const SEND_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		messageId: {
			type: "string",
			required: true
		},
		status: {
			type: "string",
			required: true,
			enum: ["accepted", "queued"]
		}
	}
};
/** `noProgress` is present only on the model-only shortcut that skips the wait. */
const WAIT_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		timedOut: {
			type: "boolean",
			required: true
		},
		noProgress: {
			type: "object",
			additionalProperties: false,
			properties: {
				reason: {
					type: "string",
					required: true,
					const: "no-active-peer"
				},
				message: {
					type: "string",
					required: true
				}
			}
		}
	}
};
const INTERRUPT_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: { previousStatus: {
		type: "string",
		required: true,
		enum: ["running", "inactive"]
	} }
};
const DELETE_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		deleted: { type: "boolean", required: true, const: true },
		target: { type: "string", required: true },
		previousStatus: {
			type: "string",
			required: true,
			enum: ["running", "inactive", "failed"]
		},
		releasedTasks: {
			type: "array",
			required: true,
			items: { type: "string" }
		}
	}
};
const SET_MODEL_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		target: { type: "string", required: true },
		model: { type: "string", required: true },
		provider: { type: "string" }
	}
};
const TASK_LIST_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		tasks: {
			type: "array",
			required: true,
			items: TASK_VIEW_SCHEMA
		},
		nextCursor: { type: "integer" }
	}
};
/**
* Declare one canonical output schema with compact model-facing JSON. Every
* Team result is a fixed record, so the declared schema is what makes the
* compiler check `execute` against the value the model is promised.
* @param schema - canonical value schema for one tool.
* @returns the `output` declaration accepted by {@link defineTool}.
*/
function jsonOutput(schema) {
	return {
		schema,
		render: (_args, value) => [{
			type: "text",
			text: JSON.stringify(value)
		}]
	};
}
/** Recover the exact caller guaranteed by Agent-scoped tool discovery. */
function callingAgent(agent, toolName) {
	/* v8 ignore next 2 -- Team tools are registered only in an exact Agent scope, so discovery supplies this carrier. */
	if (agent === void 0) throw new Error(`${toolName} requires a calling Agent`);
	return agent;
}
/** Register the complete Team tool set in one exact Agent scope. */
function install(agent, ctx, config) {
	const scoped = agent.ctx;
	const disposers = [];
	const register = (disposer) => {
		disposers.push(disposer);
	};
	try {
		register(scoped.systemPrompt.section({
			name: "whaleforce-team:policy",
			order: scoped.systemPrompt.getSectionOrder("TEAM_POLICY"),
			text: POLICY
		}));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_spawn_teammate",
			description: "Create one named, durable teammate. Only the Team Lead may call this tool.",
			parameters: {
				name: {
					type: "string",
					required: true,
					description: "Unique lower-kebab-case teammate name."
				},
				description: {
					type: "string",
					required: true,
					description: "Short description of the delegated responsibility."
				},
				prompt: {
					type: "string",
					required: true,
					description: "Complete initial task for the teammate."
				},
				context: {
					type: "string",
					enum: ["fresh", "fork"],
					description: "fresh starts without Lead history; fork inherits completed Lead turns. Defaults to fresh."
				},
				model: {
					type: "string",
					description: "Optional provider-owned model id the teammate will use instead of the Lead's route; requires a spawn provider that accepts per-child agentOptions."
				}
			},
			output: jsonOutput(SPAWN_VALUE_SCHEMA),
			async execute(args, exec) {
				const agent = callingAgent(exec.agent, "whaleforce_spawn_teammate");
				const context = args.context ?? "fresh";
				return { member: modelMember((await ctx.agentTeamsClone.spawnTeammate(agent, {
					name: args.name,
					description: args.description,
					prompt: [{
						type: "text",
						text: `<system-reminder>
You are teammate "${args.name.trim()}".
Your Team Lead is named "lead".
Use whaleforce_list_agents({}) to find your teammates and their names.
To message your Team Lead, use whaleforce_send_message({ target: "lead", message: "..." }).
To message another teammate, use whaleforce_send_message({ target: "<teammate name>", message: "..." }).
</system-reminder>

`
					}, {
						type: "text",
						text: args.prompt
					}],
					context,
					provider: context === "fork" ? config.forkProvider : config.freshProvider,
					...(args.model === void 0 ? {} : { model: args.model }),
					signal: exec.signal
				})).member) };
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_send_message",
			description: "Send one durable message to another Team member. A running target receives it at the nearest step boundary; an inactive target starts or resumes a turn.",
			parameters: {
				target: {
					type: "string",
					required: true,
					description: "Member target returned by whaleforce_spawn_teammate or whaleforce_list_agents, including lead."
				},
				message: {
					type: "string",
					required: true,
					description: "Self-contained message for the target."
				}
			},
			output: jsonOutput(SEND_VALUE_SCHEMA),
			execute(args, exec) {
				return ctx.agentTeamsClone.sendMessage(callingAgent(exec.agent, "whaleforce_send_message"), {
					target: args.target,
					content: [{
						type: "text",
						text: args.message
					}],
					signal: exec.signal
				});
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_list_agents",
			description: "List the Lead and every durable teammate with an addressable target and current availability. inactive means no turn is executing, not a task result. provisioning and failed describe member creation.",
			parameters: {},
			output: jsonOutput(MEMBER_LIST_VALUE_SCHEMA),
			execute(_args, exec) {
				return Promise.resolve(ctx.agentTeamsClone.listMembers(callingAgent(exec.agent, "whaleforce_list_agents")).map(modelMember));
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_wait_agent",
			description: "Wait for the next teammate status, mailbox, or shared-task change after this call starts. This never wakes inactive members and returns noProgress immediately when no other member is running or provisioning. Re-list after wakeup or timeout instead of polling.",
			parameters: { timeout_ms: {
				type: "integer",
				description: "Wait duration in milliseconds, from 10000 through 3600000. Defaults to 30000."
			} },
			output: jsonOutput(WAIT_VALUE_SCHEMA),
			async execute(args, exec) {
				const caller = callingAgent(exec.agent, "whaleforce_wait_agent");
				const timeoutMs = args.timeout_ms ?? 3e4;
				if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1e4 || timeoutMs > 36e5) return await ctx.agentTeamsClone.waitForChange(caller, timeoutMs, exec.signal);
				if (!ctx.agentTeamsClone.listMembers(caller).some((member) => member.id !== caller.id && ACTIVE_WAIT_STATUSES.has(member.status))) return {
					timedOut: false,
					noProgress: {
						reason: "no-active-peer",
						message: NO_ACTIVE_PEER_MESSAGE
					}
				};
				return await ctx.agentTeamsClone.waitForChange(caller, timeoutMs, exec.signal);
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_interrupt_agent",
			description: "Interrupt one teammate's current turn while preserving its pending inbox. Team Lead only.",
			parameters: { target: {
				type: "string",
				required: true,
				description: "Teammate target returned by whaleforce_spawn_teammate or whaleforce_list_agents."
			} },
			output: jsonOutput(INTERRUPT_VALUE_SCHEMA),
			execute(args, exec) {
				return Promise.resolve(ctx.agentTeamsClone.interrupt(callingAgent(exec.agent, "whaleforce_interrupt_agent"), args.target));
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_delete_teammate",
			description: "Delete one teammate: stop its live agent, remove it from the roster, and release its in-progress tasks back to pending. The teammate name is consumed forever and cannot be reused. Team Lead only.",
			parameters: { target: {
				type: "string",
				required: true,
				description: "Teammate target returned by whaleforce_spawn_teammate or whaleforce_list_agents."
			} },
			output: jsonOutput(DELETE_VALUE_SCHEMA),
			async execute(args, exec) {
				const result = await ctx.agentTeamsClone.deleteTeammate(callingAgent(exec.agent, "whaleforce_delete_teammate"), args.target);
				return {
					deleted: true,
					target: result.target,
					previousStatus: result.previousStatus,
					releasedTasks: result.releasedTasks
				};
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_set_teammate_model",
			description: "Change one teammate's model for its next turn; a step already in flight keeps its current model. Works for inactive teammates too: the selection is stored durably and applied at their next activation. Use it to move a teammate to a cheaper or stronger model mid-task instead of respawning it. The model may come from any provider in the configured catalog. Team Lead only.",
			parameters: {
				target: {
					type: "string",
					required: true,
					description: "Teammate target returned by whaleforce_spawn_teammate or whaleforce_list_agents."
				},
				model: {
					type: "string",
					required: true,
					description: "Provider-owned model id the teammate will use from its next turn."
				},
				provider: {
					type: "string",
					description: "Optional provider route that owns the model; omit to use the teammate's provider when it serves the model, else the single provider that serves it. Required when several providers serve the same model id."
				}
			},
			output: jsonOutput(SET_MODEL_VALUE_SCHEMA),
			async execute(args, exec) {
				const result = await ctx.agentTeamsClone.setTeammateModel(callingAgent(exec.agent, "whaleforce_set_teammate_model"), args.target, args.model, args.provider);
				return { target: result.target, model: result.model, provider: result.provider };
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_team_task_create",
			description: "Create one unowned pending task on the shared Team task board.",
			parameters: {
				subject: {
					type: "string",
					required: true,
					description: "Concise task title."
				},
				description: {
					type: "string",
					required: true,
					description: "Complete task details and acceptance criteria."
				},
				blocked_by: {
					type: "array",
					items: { type: "string" },
					description: "Task ids that must complete first."
				},
				write_scopes: {
					type: "array",
					items: { type: "string" },
					description: "Advisory workspace-relative file or directory prefixes this task expects to modify."
				}
			},
			output: jsonOutput(TASK_VIEW_SCHEMA),
			async execute(args, exec) {
				return await ctx.agentTeamsClone.createTask(callingAgent(exec.agent, "whaleforce_team_task_create"), {
					subject: args.subject,
					description: args.description,
					...args.blocked_by === void 0 ? {} : { blockedBy: args.blocked_by.map(TeamTaskId) },
					...args.write_scopes === void 0 ? {} : { writeScopes: args.write_scopes }
				});
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_team_task_list",
			description: "List shared tasks, including readiness, owner, revision, blockers, and write-scope warnings.",
			parameters: {
				status: {
					type: "string",
					enum: [
						"pending",
						"in_progress",
						"completed"
					],
					description: "Optional exact status filter."
				},
				owner: {
					type: "string",
					description: "Optional member target from whaleforce_spawn_teammate or whaleforce_list_agents, matching ownerName; use unowned for tasks without an owner."
				},
				ready: {
					type: "boolean",
					description: "Optional readiness filter."
				},
				cursor: {
					type: "integer",
					description: "Zero-based result offset. Defaults to 0."
				},
				limit: {
					type: "integer",
					description: "Number of rows, 1 through 100. Defaults to 50."
				}
			},
			output: jsonOutput(TASK_LIST_VALUE_SCHEMA),
			execute(args, exec) {
				const status = args.status;
				const filtered = ctx.agentTeamsClone.listTasks(callingAgent(exec.agent, "whaleforce_team_task_list")).filter((task) => (status === void 0 || task.status === status) && (args.owner === void 0 || (args.owner === "unowned" ? task.ownerName === void 0 : task.ownerName === args.owner)) && (args.ready === void 0 || task.ready === args.ready));
				const cursor = args.cursor ?? 0;
				const limit = args.limit ?? 50;
				if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error("cursor must be a non-negative safe integer");
				if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("limit must be an integer from 1 through 100");
				return Promise.resolve({
					tasks: filtered.slice(cursor, cursor + limit),
					...cursor + limit < filtered.length ? { nextCursor: cursor + limit } : {}
				});
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_team_task_get",
			description: "Read the complete latest value of one shared task before changing or executing it.",
			parameters: { task_id: {
				type: "string",
				required: true,
				description: "Shared task id."
			} },
			output: jsonOutput(TASK_VIEW_SCHEMA),
			async execute(args, exec) {
				return Promise.resolve(ctx.agentTeamsClone.getTask(callingAgent(exec.agent, "whaleforce_team_task_get"), TeamTaskId(args.task_id)));
			}
		})));
		register(scoped.tools.register(defineTool({
			name: "whaleforce_team_task_update",
			description: "Compare-and-set a shared task action using the latest revision from whaleforce_team_task_get or whaleforce_team_task_list.",
			parameters: {
				task_id: {
					type: "string",
					required: true,
					description: "Shared task id."
				},
				expected_revision: {
					type: "integer",
					required: true,
					description: "Current task revision used as the CAS precondition."
				},
				action: {
					type: "string",
					required: true,
					enum: [
						"claim",
						"release",
						"edit",
						"set_dependencies",
						"complete",
						"reopen",
						"reassign",
						"delete"
					],
					description: "Task transition to apply."
				},
				subject: {
					type: "string",
					description: "Replacement title for edit."
				},
				description: {
					type: "string",
					description: "Replacement details for edit."
				},
				blocked_by: {
					type: "array",
					items: { type: "string" },
					description: "Complete blocker list for set_dependencies."
				},
				write_scopes: {
					type: "array",
					items: { type: "string" },
					description: "Replacement advisory write scopes for edit."
				},
				owner: {
					type: "string",
					description: "Member target from whaleforce_spawn_teammate or whaleforce_list_agents for Lead-only reassign; omit to unassign."
				}
			},
			output: jsonOutput(TASK_VIEW_SCHEMA),
			async execute(args, exec) {
				return await ctx.agentTeamsClone.updateTask(callingAgent(exec.agent, "whaleforce_team_task_update"), {
					taskId: TeamTaskId(args.task_id),
					expectedRevision: args.expected_revision,
					action: args.action,
					...args.subject === void 0 ? {} : { subject: args.subject },
					...args.description === void 0 ? {} : { description: args.description },
					...args.blocked_by === void 0 ? {} : { blockedBy: args.blocked_by.map(TeamTaskId) },
					...args.write_scopes === void 0 ? {} : { writeScopes: args.write_scopes },
					...args.owner === void 0 ? {} : { owner: args.owner }
				});
			}
		})));
	} catch (error) {
		for (const dispose of disposers.reverse()) dispose();
		throw error;
	}
	return () => {
		for (const dispose of disposers.reverse()) dispose();
	};
}
/** Install Team tools in every live or subsequently published Team member scope. */
function apply(ctx, config = {}) {
	const resolved = {
		freshProvider: config.freshProvider ?? "spawn",
		forkProvider: config.forkProvider ?? "fork"
	};
	const installed = /* @__PURE__ */ new Map();
	const maybeInstall = (agent) => {
		if (installed.has(agent) || ctx.agentTeamsClone.tryMembership(agent) === void 0) return;
		installed.set(agent, install(agent, ctx, resolved));
	};
	for (const agent of ctx.agents.list()) maybeInstall(agent);
	ctx.on("agent/created", ({ agent }) => {
		maybeInstall(agent);
	});
	ctx.on("agent/disposed", ({ agent }) => {
		installed.get(agent)?.();
		installed.delete(agent);
	});
	ctx.effect(() => () => {
		for (const dispose of installed.values()) dispose();
		installed.clear();
	}, "tool-agent-team-whaleforce.scopedTools()");
}
//#endregion
export { Config, apply, inject, name };
