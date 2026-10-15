/**
 * dsh-agent-team-whaleforce-sessions client bundle.
 * Grouped subagent-session catalog (Running, Idle, Completed, Error) replacing
 * the official `ui-subagent` trigger via the layer swap. Mirrors the
 * `dsh-agent-team-whaleforce-ui` bundle registration pattern:
 * `window.__ModuleLoader__.load({ id, factory })` with `exports.inject` and
 * `exports.apply`.
 */
window.__ModuleLoader__.load({
	id: "dsh-agent-team-whaleforce-sessions",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:/dsh-plugin-WhaleForce/packages/client-ui-agent-team-sessions/src/client/Catalog.module.css.mjs
		const css = ""
			+ ".WfS_root{position:relative;display:inline-flex;align-items:center;gap:10px;min-width:0}"
			+ ".WfS_trigger{display:inline-flex;align-items:center;min-height:28px;padding:3px 2px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;cursor:pointer}"
			+ ".WfS_trigger:hover,.WfS_trigger:focus-visible{color:var(--dsw-alias-label-primary)}"
			+ ".WfS_trigger svg{transition:transform 120ms ease}"
			+ ".WfS_triggerOpen{transform:rotate(180deg)}"
			+ ".WfS_activitySlot{display:inline-flex;flex:none;align-items:center;justify-content:center;width:14px;height:14px}"
			+ ".WfS_menu{position:fixed;z-index:100;box-sizing:border-box;display:flex;flex-direction:column;width:336px;max-width:min(400px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 140px));padding:3px;overflow:hidden;border-radius:var(--dsw-radius-lg);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent)}"
			+ ".WfS_menu:before{content:\"\";position:absolute;z-index:-1;inset:0;border-radius:inherit;background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter)}"
			+ ".WfS_menuBody{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow:auto}"
			+ ".WfS_groupHeader{display:flex;align-items:center;gap:6px;box-sizing:border-box;width:100%;min-height:26px;padding:2px 9px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:15px;font-weight:500;text-align:left;cursor:pointer;outline:none}"
			+ ".WfS_groupHeader:hover,.WfS_groupHeader:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}"
			+ ".WfS_groupHeader{margin-top:4px}"
			+ ".WfS_menuBody > .WfS_groupHeader:first-child{margin-top:0}"
			+ ".WfS_groupLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
			+ ".WfS_groupCount{flex:none;color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums}"
			+ ".WfS_node{position:relative;min-width:0}"
			+ ".WfS_menuBody > .WfS_node{margin-left:-2px}"
			+ ".WfS_row{position:relative;display:flex;align-items:flex-start;gap:6px;box-sizing:border-box;width:100%;min-height:44px;padding:6px 7px 6px 9px;border:0;border-radius:var(--dsw-radius-lg);background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;line-height:17px;text-align:left;cursor:pointer;outline:none}"
			+ ".WfS_row:hover > .WfS_clickarea,.WfS_row:focus-visible > .WfS_clickarea{background:var(--dsw-alias-interactive-bg-hover)}"
			+ ".WfS_clickarea{box-sizing:border-box;display:flex;flex:1;align-self:stretch;align-items:flex-start;gap:6px;min-width:0;margin:-6px -7px -6px;padding:6px 7px;border-radius:var(--dsw-radius-lg)}"
			+ ".WfS_rowActivitySlot{display:inline-flex;flex:none;align-items:center;justify-content:center;width:14px;height:17px}"
			+ ".WfS_disclosure,.WfS_disclosureSpace{flex:none;width:14px;height:17px}"
			+ ".WfS_disclosure{display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:transform 120ms ease}"
			+ ".WfS_disclosure svg{width:12px;height:12px}"
			+ ".WfS_disclosure:hover{color:var(--dsw-alias-label-primary)}"
			+ ".WfS_disclosureOpen{transform:rotate(90deg)}"
			+ ".WfS_content{display:flex;flex:1;flex-direction:column;min-width:0}"
			+ ".WfS_label,.WfS_summary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
			+ ".WfS_label{color:inherit;font-weight:400}"
			+ ".WfS_currentLabel{font-weight:600}"
			+ ".WfS_summary,.WfS_metrics{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px}"
			+ ".WfS_metrics{display:grid;grid-template-rows:17px 15px;flex:none;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}"
			+ ".WfS_metricToken{grid-row:1;line-height:17px}"
			+ ".WfS_metricDuration{grid-row:2}"
			+ ".WfS_sidebarButton{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;margin:4px 0;padding:6px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}"
			+ ".WfS_sidebarButton:hover,.WfS_sidebarButton:focus-visible{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}"
			+ ".WfS_children{position:relative;margin-left:16px;padding-left:3px}"
			+ ".WfS_children:before,.WfS_children > .WfS_node:before{content:\"\";position:absolute;left:0;border-left:0.5px solid var(--dsw-alias-border-l2)}"
			+ ".WfS_children:before{top:-23px;height:23px}"
			+ ".WfS_children[aria-busy='true']:before{content:none}"
			+ ".WfS_children > .WfS_node:before{top:0;bottom:0;left:-3px}"
			+ ".WfS_children > .WfS_node:last-child:before{bottom:auto;height:15px}"
			+ ".WfS_children > .WfS_node > .WfS_row:before{content:\"\";position:absolute;top:14px;left:-3px;width:12px;border-top:0.5px solid var(--dsw-alias-border-l2)}"
			+ ".WfS_notice,.WfS_error{padding:8px 10px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}"
			+ ".WfS_error{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--dsw-alias-state-error-primary)}"
			+ ".WfS_refresh{display:inline-flex;flex:none;align-items:center;gap:3px;padding:3px 5px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:inherit;cursor:pointer}"
			+ ".WfS_refresh svg{width:12px;height:12px}"
			+ ".WfS_refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId = "dsh-agent-team-whaleforce-sessions/Catalog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-agent-team-whaleforce-sessions";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Grouped subagent-session catalog dictionaries. */
		/** Locale namespace owned by the Agent Teams sessions UI. */
		const NS = "agent-team-whaleforce-sessions";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"duration.seconds": "{seconds}秒",
			"duration.minutes": "{minutes}分{seconds}秒",
			"duration.hours": "{hours}小时{minutes}分{seconds}秒",
			"duration.days": "{days}天",
			"duration.daysHours": "{days}天{hours}小时",
			"duration.months": "约{months}个月",
			"duration.monthsDays": "约{months}个月{days}天",
			"duration.years": "约{years}年",
			"duration.yearsMonths": "约{years}年{months}个月",
			"duration.exactDays": "{days}天{hours}小时{minutes}分{seconds}秒",
			"duration.exactTitle": "总活跃耗时：{duration}",
			"tokens.thousand": "{value}K",
			"tokens.million": "{value}M",
			"tokens.total": "{value} tok",
			"loading.label": "正在加载子智能体…",
			"load.error": "无法加载子智能体",
			"catalog.migrationRequired": "需要迁移",
			"retry": "重试",
			"mode.external": "外部任务",
			"mode.oneShot": "一次性",
			"mode.continuable": "可继续",
			"mode.unknown": "模式未知",
			"activity.running": "正在运行",
			"activity.completed": "已完成",
			"activity.inactive": "当前未运行",
			"branch.collapse": "收起 {label} 的下级子智能体",
			"branch.expand": "展开 {label} 的下级子智能体",
			"count.total.one": "{count} 个子智能体",
			"count.total.other": "{count} 个子智能体",
			"count.running.one": "{count} 个子智能体，正在运行",
			"count.running.other": "{count} 个子智能体，正在运行",
			"tree.aria": "子智能体会话",
			"open.sidebar": "在侧边栏打开",
			"open.sidebar.aria": "在侧边栏打开 {label}",
			"sidebar.chat": "聊天",
			"group.running": "运行中",
			"group.idle": "空闲",
			"group.completed": "已完成",
			"group.error": "出错",
			"trigger.aria.grouped": "子智能体会话：{running}个运行中，{idle}个空闲，{done}个已完成，{error}个出错"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			"duration.hours": "{hours}h {minutes}m {seconds}s",
			"duration.days": "{days}d",
			"duration.daysHours": "{days}d {hours}h",
			"duration.months": "~{months}mo",
			"duration.monthsDays": "~{months}mo {days}d",
			"duration.years": "~{years}y",
			"duration.yearsMonths": "~{years}y {months}mo",
			"duration.exactDays": "{days}d {hours}h {minutes}m {seconds}s",
			"duration.exactTitle": "Total active duration: {duration}",
			"tokens.thousand": "{value}K",
			"tokens.million": "{value}M",
			"tokens.total": "{value} tok",
			"loading.label": "Loading subagents…",
			"load.error": "Unable to load subagents",
			"catalog.migrationRequired": "Migration required",
			"retry": "Retry",
			"mode.external": "External task",
			"mode.oneShot": "one-shot",
			"mode.continuable": "continuable",
			"mode.unknown": "unknown mode",
			"activity.running": "running",
			"activity.completed": "completed",
			"activity.inactive": "not running",
			"branch.collapse": "Collapse {label} descendants",
			"branch.expand": "Expand {label} descendants",
			"count.total.one": "{count} subagent",
			"count.total.other": "{count} subagents",
			"count.running.one": "{count} subagent running",
			"count.running.other": "{count} subagents running",
			"tree.aria": "Subagent sessions",
			"open.sidebar": "Open in sidebar",
			"open.sidebar.aria": "Open {label} in sidebar",
			"sidebar.chat": "Chat",
			"group.running": "Running",
			"group.idle": "Idle",
			"group.completed": "Completed",
			"group.error": "Error",
			"trigger.aria.grouped": "Subagent sessions: {running} running, {idle} idle, {done} completed, {error} error"
		};
		//#endregion
		//#region lib/types/client/catalog.js
		/** Grouped subagent-session catalog. Ported from the official
		 * `SubagentHeaderLineage.tsx` count-variant dropdown with the root level
		 * partitioned into status groups. */
		const h = react.createElement;
		/** Focusable tree items in DOM order, excluding disabled rows. */
		function treeItems(root) {
			return root === null
				? []
				: Array.from(root.querySelectorAll('[role="treeitem"]:not([aria-disabled="true"])'));
		}
		/** Compact token count shared in shape with the conversation stats strip. */
		function formatTokens(value, t) {
			const scaled = (next) => next >= 100
				? String(Math.round(next))
				: String(Math.round(next * 10) / 10);
			if (value < 1000) return String(value);
			if (value < 1000000) return t("tokens.thousand", { value: scaled(value / 1000) });
			return t("tokens.million", { value: scaled(value / 1000000) });
		}
		/** Sum the four disjoint durable provider-usage buckets. */
		function tokenTotal(usage) {
			return usage === undefined
				? undefined
				: usage.uncachedInputTokens + usage.outputTokens
					+ usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/** Exact whole-second active-turn duration for one catalog row. */
		function activityDuration(summary, activity, now) {
			if (summary === undefined) return undefined;
			const timing = summary.projectionValues?.subagentTiming;
			if (timing === undefined) return undefined;
			if (timing.active === undefined) return timing.settledMs;
			const end = activity === "running"
				? now
				: timing.active.through;
			return timing.settledMs + Math.max(0, end - timing.active.since);
		}
		function splitDuration(ms) {
			const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
			const totalMinutes = Math.floor(totalSeconds / 60);
			const totalHours = Math.floor(totalMinutes / 60);
			return {
				seconds: totalSeconds % 60,
				minutes: totalMinutes % 60,
				hours: totalHours % 24,
				days: Math.floor(totalHours / 24),
				totalMinutes,
				totalHours,
			};
		}
		/** Format a duration with decreasing visual precision at larger scales. */
		function formatDuration(ms, t) {
			const { seconds, minutes, hours, days, totalMinutes, totalHours } = splitDuration(ms);
			if (days >= 365) {
				const years = Math.floor(days / 365);
				const months = Math.floor((days % 365) / 30);
				return months === 0
					? t("duration.years", { years })
					: t("duration.yearsMonths", { years, months });
			}
			if (days >= 30) {
				const months = Math.floor(days / 30);
				const remainingDays = days % 30;
				return remainingDays === 0
					? t("duration.months", { months })
					: t("duration.monthsDays", { months, days: remainingDays });
			}
			if (days > 0) {
				return hours === 0
					? t("duration.days", { days })
					: t("duration.daysHours", { days, hours });
			}
			if (totalHours > 0) {
				return t("duration.hours", {
					hours: totalHours,
					minutes: String(minutes).padStart(2, "0"),
					seconds: String(seconds).padStart(2, "0"),
				});
			}
			if (totalMinutes > 0) {
				return t("duration.minutes", {
					minutes: totalMinutes,
					seconds: String(seconds).padStart(2, "0"),
				});
			}
			return t("duration.seconds", { seconds });
		}
		/** Preserve exact whole seconds for hover and accessible naming. */
		function formatExactDuration(ms, t) {
			const { seconds, minutes, hours, days } = splitDuration(ms);
			return days === 0
				? formatDuration(ms, t)
				: t("duration.exactDays", {
					days,
					hours: String(hours).padStart(2, "0"),
					minutes: String(minutes).padStart(2, "0"),
					seconds: String(seconds).padStart(2, "0"),
				});
		}
		/** Render catalog loading without inventing child membership. */
		function CatalogLoadingRows({ t }) {
			return h("div", { className: "WfS_notice" }, t("loading.label"));
		}
		/** A child becomes a known leaf only after its own authoritative catalog loads empty. */
		function isKnownLeaf(catalog) {
			return catalog?.state === "ready" && catalog.entries.length === 0;
		}
		/** Render one catalog level and recurse only through explicitly expanded rows. */
		function CatalogRows({
			parentSessionId, currentSessionId, catalog, catalogs, summaries, expanded, level,
			openChild, openChildAside, refreshProjection, toggleBranch, closeCatalog, t,
		}) {
			const [now, setNow] = react.useState(() => Date.now());
			const running = catalog.entries.some((entry) => entry.activity === "running");
			react.useEffect(() => {
				if (!running) return;
				const timer = setInterval(() => { setNow(Date.now()) }, 1000);
				return () => { clearInterval(timer) };
			}, [running]);
			const emptyLoading = catalog.state === "loading" && catalog.entries.length === 0;
			const reserveDisclosure = catalog.entries.some((entry) =>
				entry.mode !== "external" && !isKnownLeaf(catalogs[entry.id])
				&& summaries[entry.id]?.formatStatus !== "migration-required"
				&& catalogs[entry.id]?.state !== "migration-required");
			return h(react.Fragment, null,
				emptyLoading && h(CatalogLoadingRows, { t }),
				catalog.state === "error" && h("div", { className: "WfS_error" },
					h("span", null, catalog.error?.message ?? t("load.error")),
					h("button", {
						type: "button",
						className: "WfS_refresh",
						onClick: () => { refreshProjection(parentSessionId) },
					},
						h(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }),
						t("retry"))),
				catalog.entries.map((entry) => {
					const external = entry.mode === "external";
					const childCatalog = catalogs[entry.id];
					const isCurrent = entry.id === currentSessionId;
					const knownLeaf = external || isKnownLeaf(childCatalog);
					const requiresOpening = summaries[entry.id]?.formatStatus === "migration-required"
						|| childCatalog?.state === "migration-required";
					const canExpand = !knownLeaf && !requiresOpening;
					const isExpanded = canExpand && expanded.has(entry.id);
					const childLoading = childCatalog === undefined
						|| (childCatalog.state === "loading" && childCatalog.entries.length === 0);
					const summary = summaries[entry.id];
					const label = entry.label ?? entry.id;
					const mode = external ? t("mode.external") : entry.mode === "unknown" ? t("mode.unknown")
						: entry.mode === "one-shot" ? t("mode.oneShot") : t("mode.continuable");
					const completed = !external && entry.activity === "inactive"
						&& summary?.projectionValues?.subagentTiming?.lastTurnCompleted === true;
					const activity = external ? undefined : entry.activity === "running"
						? t("activity.running")
						: completed
							? t("activity.completed")
							: t("activity.inactive");
					const secondary = [summary?.title, requiresOpening ? t("catalog.migrationRequired") : mode, activity]
						.filter((value) => value !== undefined)
						.join(" · ");
					const totalTokens = tokenTotal(summary?.projectionValues?.tokenUsage);
					const durationMs = activityDuration(summary, entry.activity, now);
					const tokenMetric = totalTokens === undefined
						? undefined
						: t("tokens.total", { value: formatTokens(totalTokens, t) });
					const durationMetric = durationMs === undefined
						? undefined
						: {
							compact: formatDuration(durationMs, t),
							exact: formatExactDuration(durationMs, t),
						};
					const metrics = [tokenMetric, durationMetric?.exact]
						.filter((value) => value !== undefined)
						.join(" · ");
					const open = () => {
						if (external) return;
						openChild({
							parentSessionId,
							childSessionId: entry.id,
							mode: entry.mode,
						});
						closeCatalog();
					};
					const handleKey = (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							event.stopPropagation();
							open();
						} else if (
							(event.key === "ArrowRight" && canExpand && !isExpanded)
							|| (event.key === "ArrowLeft" && isExpanded)
						) {
							event.preventDefault();
							event.stopPropagation();
							toggleBranch(entry.id);
						}
					};
					const toggle = (event) => {
						event.preventDefault();
						event.stopPropagation();
						toggleBranch(entry.id);
					};
					return h("div", { key: entry.id, className: "WfS_node" },
						h("div", {
							role: "treeitem",
							tabIndex: external ? -1 : 0,
							"aria-disabled": external || undefined,
							"aria-level": level,
							"aria-current": isCurrent || undefined,
							"aria-label": [label, secondary, metrics].filter((value) => value !== "").join(" "),
							...(canExpand ? { "aria-expanded": isExpanded } : {}),
							className: "WfS_row",
							onClick: open,
							onKeyDown: handleKey,
						},
							!canExpand
								? reserveDisclosure && h("span", { className: "WfS_disclosureSpace" })
								: h("button", {
									type: "button",
									tabIndex: -1,
									className: "WfS_disclosure" + (isExpanded ? " WfS_disclosureOpen" : ""),
									"aria-label": t(isExpanded ? "branch.collapse" : "branch.expand", { label }),
									onClick: toggle,
								},
									h(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular)),
							h("div", { className: "WfS_clickarea" },
								h("span", { className: "WfS_rowActivitySlot" },
									h(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
										state: entry.activity === "running" ? "ongoing" : completed ? "done" : "idle",
									})),
								h("span", { className: "WfS_content" },
									h("span", {
										className: "WfS_label" + (isCurrent ? " WfS_currentLabel" : ""),
										children: label,
									}),
									h("span", { className: "WfS_summary", children: secondary })),
								metrics !== "" && h("span", { className: "WfS_metrics" },
									tokenMetric !== undefined && h("span", { className: "WfS_metricToken", children: tokenMetric }),
									durationMetric !== undefined && h("span", {
										className: "WfS_metricDuration",
										title: t("duration.exactTitle", { duration: durationMetric.exact }),
										children: durationMetric.compact,
									})),
								!isCurrent && !external && h(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("open.sidebar"),
									side: "bottom",
									align: "end",
								}, h("button", {
									type: "button",
									className: "WfS_sidebarButton",
									"aria-label": t("open.sidebar.aria", { label }),
									onClick: (event) => {
										event.preventDefault();
										event.stopPropagation();
										openChildAside({ parentSessionId, childSessionId: entry.id, mode: entry.mode });
										closeCatalog();
									},
									onKeyDown: (event) => { event.stopPropagation() },
								},
									h(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular))))),
						isExpanded && h("div", {
							role: "group",
							className: "WfS_children",
							"aria-busy": childLoading || undefined,
						},
							childCatalog === undefined
								? h(CatalogLoadingRows, { t })
								: h(CatalogRows, {
									parentSessionId: entry.id,
									currentSessionId,
									catalog: childCatalog,
									catalogs,
									summaries,
									expanded,
									level: level + 1,
									openChild,
									openChildAside,
									refreshProjection,
									toggleBranch,
									closeCatalog,
									t,
								})));
				}));
		}
		const MENU_VIEWPORT_MARGIN = 16;
		/** Place a portaled catalog below its trigger without crossing the viewport edge. */
		function catalogMenuPosition(trigger) {
			const rect = trigger.getBoundingClientRect();
			const width = Math.min(336, window.innerWidth - MENU_VIEWPORT_MARGIN * 2);
			return {
				top: rect.bottom + 5,
				left: Math.min(
					Math.max(MENU_VIEWPORT_MARGIN, rect.left),
					window.innerWidth - width - MENU_VIEWPORT_MARGIN,
				),
			};
		}
		/** Fixed status-group order; within a group rows sort newest-first. */
		const GROUP_KEYS = ["running", "idle", "completed", "error"];
		/** Groups collapsed by default except Running; reset on every menu close. */
		const DEFAULT_COLLAPSED = () => new Set(["idle", "completed", "error"]);
		/**
		 * Partition the root-level entries into exclusive status groups. Running
		 * keeps precedence over a member error row; a member error absorbs the row
		 * from Idle and Completed so no row appears twice.
		 */
		function groupRootEntries(entries, summaries, erroredIds) {
			const groups = { running: [], idle: [], completed: [], error: [] };
			for (const entry of entries) {
				const external = entry.mode === "external";
				const summary = summaries[entry.id];
				const completed = !external && entry.activity === "inactive"
					&& summary?.projectionValues?.subagentTiming?.lastTurnCompleted === true;
				let group;
				if (entry.activity === "running") group = "running";
				else if (erroredIds.has(entry.id)) group = "error";
				else if (completed) group = "completed";
				else group = "idle";
				groups[group].push(entry);
			}
			for (const key of GROUP_KEYS) {
				groups[key].sort((a, b) => b.createdAt - a.createdAt);
			}
			return groups;
		}
		/** One trigger-plus-grouped-tree dropdown over the catalog rooted at `rootSessionId`. */
		function GroupedCatalogDropdown({
			rootSessionId, useSessions, useSessionStatus, openChild, openChildAside, refreshProjection, t,
		}) {
			const projections = useSessions((state) => state.projectionsBySession);
			const summaries = useSessions((state) => state.byId);
			const statuses = useSessionStatus((value) => value);
			const catalogs = react.useMemo(() => {
				return Object.fromEntries(Object.entries(projections).map(([id, snapshot]) => {
					const projected = snapshot.values.subagentCatalog;
					const state = snapshot.state === "idle"
						? projected === undefined ? "loading" : "ready"
						: snapshot.state === "migration-required" && projected !== undefined ? "ready" : snapshot.state;
					return [id, {
						state,
						error: snapshot.error,
						entries: (projected ?? []).map((entry) => ({
							...entry,
							activity: (statuses.get(entry.id)?.running ?? summaries[entry.id]?.running) === true
								? "running" : "inactive",
						})),
						}];
					}));
			}, [projections, summaries, statuses]);
			const catalog = catalogs[rootSessionId];
			const members = projections[rootSessionId]?.values.agentTeam?.members ?? [];
			const erroredIds = react.useMemo(
				() => new Set(members.filter((member) => member.error !== undefined).map((member) => member.id)),
				[members],
			);
			const [open, setOpen] = react.useState(false);
			const [menuPosition, setMenuPosition] = react.useState(undefined);
			const [expanded, setExpanded] = react.useState(() => new Set());
			const [collapsed, setCollapsed] = react.useState(DEFAULT_COLLAPSED);
			const rootRef = react.useRef(null);
			const triggerRef = react.useRef(null);
			const menuRef = react.useRef(null);
			const hoverOpenTimer = react.useRef(undefined);
			const hoverCloseTimer = react.useRef(undefined);
			// A click-opened (pinned) menu ignores hover-out; only explicit dismissal closes it.
			const pinnedRef = react.useRef(false);
			const directChildren = catalog?.entries ?? [];
			const directCount = directChildren.length;
			const runningCount = directChildren.filter((entry) => entry.activity === "running").length;
			const groups = react.useMemo(
				() => groupRootEntries(directChildren, summaries, erroredIds),
				[catalog, summaries, erroredIds],
			);
			const totalCountKey = directCount === 1 ? "count.total.one" : "count.total.other";
			const runningCountKey = runningCount === 1 ? "count.running.one" : "count.running.other";
			// The official trigger wording stays when running or only the bare total
			// speak; per-state counts are added when one of them is nonzero.
			const idleCount = groups.idle.length;
			const doneCount = groups.completed.length;
			const errorCount = groups.error.length;
			const ariaLabel = runningCount > 0
				? t(runningCountKey, { count: runningCount })
				: idleCount + doneCount + errorCount > 0
					? t("trigger.aria.grouped", { running: 0, idle: idleCount, done: doneCount, error: errorCount })
					: t(totalCountKey, { count: directCount });
			const cancelHoverClose = () => {
				if (hoverCloseTimer.current === undefined) return;
				clearTimeout(hoverCloseTimer.current);
				hoverCloseTimer.current = undefined;
			};
			const cancelHoverOpen = () => {
				if (hoverOpenTimer.current === undefined) return;
				clearTimeout(hoverOpenTimer.current);
				hoverOpenTimer.current = undefined;
			};
			const changeOpen = (next, restoreFocus = false) => {
				cancelHoverOpen();
				cancelHoverClose();
				if (next) {
					const trigger = triggerRef.current;
					if (trigger === null) return;
					setOpen(true);
					setMenuPosition(catalogMenuPosition(trigger));
				}
				else {
					pinnedRef.current = false;
					setOpen(false);
					setMenuPosition(undefined);
					setExpanded(new Set());
					setCollapsed(DEFAULT_COLLAPSED());
				}
				if (restoreFocus) queueMicrotask(() => { triggerRef.current?.focus() });
			};
			const scheduleHoverOpen = () => {
				cancelHoverOpen();
				cancelHoverClose();
				if (open) return;
				hoverOpenTimer.current = setTimeout(() => {
					hoverOpenTimer.current = undefined;
					changeOpen(true);
				}, 150);
			};
			const scheduleHoverClose = () => {
				cancelHoverOpen();
				cancelHoverClose();
				if (pinnedRef.current) return;
				hoverCloseTimer.current = setTimeout(() => {
					hoverCloseTimer.current = undefined;
					changeOpen(false);
				}, 120);
			};
			const closeBranch = (root) => {
				const closing = new Set();
				const visit = (parentSessionId) => {
					if (closing.has(parentSessionId) || !expanded.has(parentSessionId)) return;
					closing.add(parentSessionId);
					const branch = catalogs[parentSessionId];
					for (const entry of branch?.entries ?? []) {
						visit(entry.id);
					}
				};
				visit(root);
				setExpanded((current) => new Set([...current].filter((id) => !closing.has(id))));
			};
			const toggleBranch = (childSessionId) => {
				if (expanded.has(childSessionId)) {
					closeBranch(childSessionId);
					return;
				}
				setExpanded((current) => new Set(current).add(childSessionId));
				refreshProjection(childSessionId);
			};
			const toggleGroup = (key) => {
				setCollapsed((current) => {
					const next = new Set(current);
					if (next.has(key)) next.delete(key);
					else next.add(key);
					return next;
				});
			};
			react.useEffect(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (
						event.target instanceof Node
						&& !rootRef.current?.contains(event.target)
						&& !menuRef.current?.contains(event.target)
					) {
						changeOpen(false);
					}
				};
				document.addEventListener("pointerdown", closeOutside);
				return () => { document.removeEventListener("pointerdown", closeOutside) };
			}, [open]);
			react.useEffect(() => {
				if (!open) return;
				const placeMenu = () => {
					const trigger = triggerRef.current;
					if (trigger === null) return;
					setMenuPosition(catalogMenuPosition(trigger));
				};
				window.addEventListener("resize", placeMenu);
				document.addEventListener("scroll", placeMenu, true);
				return () => {
					window.removeEventListener("resize", placeMenu);
					document.removeEventListener("scroll", placeMenu, true);
				};
			}, [open]);
			react.useEffect(() => () => {
				cancelHoverOpen();
				cancelHoverClose();
			}, []);
			// Visibility needs catalog evidence of children or a failed load worth retrying.
			// An empty loading catalog is not evidence of children.
			const visible = catalog !== undefined
				&& (catalog.state === "error" || catalog.entries.length > 0);
			react.useEffect(() => {
				if (visible) return;
				cancelHoverOpen();
				cancelHoverClose();
				if (!open) return;
				pinnedRef.current = false;
				setOpen(false);
				setExpanded(new Set());
				setCollapsed(DEFAULT_COLLAPSED());
			}, [visible, open]);
			if (!visible) return null;
			const focusAt = (index) => {
				const items = treeItems(menuRef.current);
				if (items.length === 0) return;
				items[(index + items.length) % items.length]?.focus();
			};
			const navigate = (event) => {
				const items = treeItems(menuRef.current);
				const index = items.indexOf(document.activeElement);
				if (event.key === "Escape") {
					event.preventDefault();
					changeOpen(false, true);
				} else if (event.key === "Home") {
					event.preventDefault();
					focusAt(0);
				} else if (event.key === "End") {
					event.preventDefault();
					focusAt(items.length - 1);
				} else if (event.key === "ArrowDown") {
					event.preventDefault();
					focusAt(index + 1);
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					focusAt(index < 0 ? items.length - 1 : index - 1);
				}
			};
			const groupHeaderKey = (event, key) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					event.stopPropagation();
					toggleGroup(key);
				} else if (event.key === "ArrowRight" && collapsed.has(key)) {
					event.preventDefault();
					event.stopPropagation();
					toggleGroup(key);
				} else if (event.key === "ArrowLeft" && !collapsed.has(key)) {
					event.preventDefault();
					event.stopPropagation();
					toggleGroup(key);
				}
			};
			const emptyLoading = catalog.state === "loading" && catalog.entries.length === 0;
			// Loading roots report their banner once at the top; each group renders
			// its own rows with the root banner state preserved.
			const groupCatalog = (key) => ({
				state: catalog.state === "loading" ? "ready" : catalog.state,
				error: null,
				entries: groups[key],
			});
			return h("div", {
				className: "WfS_root",
				ref: rootRef,
				onKeyDown: navigate,
				onMouseLeave: scheduleHoverClose,
			},
				h("button", {
					ref: triggerRef,
					onMouseEnter: scheduleHoverOpen,
					type: "button",
					className: "WfS_trigger",
					"aria-haspopup": "tree",
					"aria-expanded": open,
					"aria-label": ariaLabel,
					onClick: () => {
						cancelHoverOpen();
						cancelHoverClose();
						pinnedRef.current = true;
						if (!open) changeOpen(true);
					},
					onKeyDown: (event) => {
						if (event.key !== "ArrowDown") return
						event.preventDefault();
						if (!open) changeOpen(true);
						queueMicrotask(() => { focusAt(0) });
					},
				},
					runningCount > 0 && h("span", { className: "WfS_activitySlot" },
						h(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" })),
					h("span", { className: "WfS_count", children: t(totalCountKey, { count: directCount }) }),
					h(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						className: open ? "WfS_triggerOpen" : undefined,
					})),
				open && react_dom.createPortal(h("div", {
					ref: menuRef,
					className: "WfS_menu",
					style: menuPosition,
					onMouseEnter: cancelHoverClose,
					onMouseLeave: scheduleHoverClose,
				},
					h("div", { className: "WfS_menuBody", role: "tree", "aria-label": t("tree.aria") },
						emptyLoading && h(CatalogLoadingRows, { t }),
						catalog.state === "error" && h("div", { className: "WfS_error" },
							h("span", null, catalog.error?.message ?? t("load.error")),
							h("button", {
								type: "button",
								className: "WfS_refresh",
								onClick: () => { refreshProjection(rootSessionId) },
							},
								h(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }),
								t("retry"))),
						GROUP_KEYS.map((key) => {
							const rows = groups[key];
							if (key === "error" && rows.length === 0) return null;
							const isCollapsed = collapsed.has(key);
							return h(react.Fragment, { key: key },
								h("div", {
									role: "treeitem",
									tabIndex: 0,
									"aria-level": 1,
									"aria-expanded": !isCollapsed,
									className: "WfS_groupHeader",
									onClick: () => { toggleGroup(key) },
									onKeyDown: (event) => { groupHeaderKey(event, key) },
								},
									h("button", {
										type: "button",
										tabIndex: -1,
										className: "WfS_disclosure" + (isCollapsed ? "" : " WfS_disclosureOpen"),
										"aria-label": t(isCollapsed ? "branch.expand" : "branch.collapse", {
											label: t("group." + key),
										}),
										onClick: (event) => {
											event.preventDefault();
											event.stopPropagation();
											toggleGroup(key);
										},
									},
										h(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular)),
									h("span", { className: "WfS_groupLabel", children: t("group." + key) }),
									h("span", { className: "WfS_groupCount", children: rows.length })),
								!isCollapsed && rows.length > 0 && h(CatalogRows, {
									parentSessionId: rootSessionId,
									currentSessionId: undefined,
									catalog: groupCatalog(key),
									catalogs,
									summaries,
									expanded,
									level: 1,
									openChild,
									openChildAside,
									refreshProjection,
									toggleBranch,
									closeCatalog: () => { changeOpen(false) },
									t,
								}));
						}))), document.body));
		}
		/**
		 * Session-header grouped catalog action for root sessions. Child sessions
		 * render nothing here; the Team Panel trigger keeps leading it via the
		 * same band.
		 */
		function GroupedSubagentCatalog({
			sessionId, useSessions, useSessionStatus, openChild, openChildAside, refreshProjection, t,
		}) {
			const isChild = useSessions((state) => state.byId[sessionId]?.origin === "subagent");
			if (isChild) return null;
			return h(GroupedCatalogDropdown, {
				key: sessionId,
				rootSessionId: sessionId,
				useSessions,
				useSessionStatus,
				openChild,
				openChildAside,
				refreshProjection,
				t,
			});
		}
		//#endregion
		//#region lib/types/client/sidebar-chat.js
		/** Right-Sidebar presentation of an existing subagent Conversation. Ported
		 * from the official `sidebar-chat/index.tsx`; the disabled `ui-subagent`
		 * row no longer registers it, so the replacement re-registers it here. */
		/** Stable implementation identity for the Sidebar tab body. */
		const SUBAGENT_CHAT_ID = "@deepseek-ai/dsh-client-ui-subagent";
		/** Resource-address prefix for an embedded Session chat. */
		const SUBAGENT_CHAT_ADDRESS = "dsh-resource://subagentchat/session/";
		/**
		 * Address one subagent Session together with the routing facts needed to restore it.
		 * @param address - durable direct-parent subagent address.
		 * @returns canonical Sidebar resource address.
		 */
		function subagentChatAddress(address) {
			const query = new URLSearchParams({
				parent: address.parentSessionId,
				mode: address.mode,
			});
			return `${SUBAGENT_CHAT_ADDRESS}${encodeURIComponent(address.childSessionId)}?${query}`;
		}
		/**
		 * Parse one canonical Sidebar chat resource address.
		 * @param value - possible chat resource address.
		 * @returns the encoded direct-parent address, or undefined for another or malformed resource.
		 */
		function parseSubagentChatAddress(value) {
			let url;
			try {
				url = new URL(value);
			} catch (_invalidUrl) {
				return undefined;
			}
			if (url.protocol !== "dsh-resource:" || url.hostname.toLowerCase() !== "subagentchat") return undefined;
			const parts = url.pathname.split("/").filter(Boolean);
			if (parts.length !== 2 || parts[0] !== "session") return undefined;
			const parentSessionId = url.searchParams.get("parent");
			const mode = url.searchParams.get("mode");
			if (parentSessionId === null || parentSessionId === "" || (mode !== "one-shot" && mode !== "continuable" && mode !== "unknown")) {
				return undefined;
			}
			try {
				const childSessionId = decodeURIComponent(parts[1]);
				return {
					parentSessionId,
					childSessionId,
					mode,
				};
			} catch (_invalidEncoding) {
				return undefined;
			}
		}
		function waitForAbort(signal) {
			if (signal.aborted) return Promise.resolve();
			return new Promise((resolve) => {
				signal.addEventListener("abort", () => { resolve() }, { once: true });
			});
		}
		function isAbortRequested(signal) {
			return signal.aborted;
		}
		function subagentChatResourceProvider(sessions) {
			return {
				protocol: "subagentchat",
				async *open(resourceAddress, { signal }) {
					const address = parseSubagentChatAddress(resourceAddress);
					if (address === undefined) throw new Error(`dsh-agent-team-whaleforce-sessions: invalid chat resource address "${resourceAddress}"`);
					if (isAbortRequested(signal)) return;
					const reference = sessions.retain(address, { source: "sidebarChat", signal });
					try {
						yield { ok: true, value: { address, reference } };
						await waitForAbort(signal);
					} finally {
						reference.release();
					}
				},
			};
		}
		/** Fixed Chat selection used by an embedded Conversation occurrence. */
		function FixedChatConversationView(props) {
			return h(react.Fragment, null, props.renderSlot("conversation.session", { view: "chat" }));
		}
		/** Render the shared Conversation content for one explicitly provided child Session. */
		function ConversationSlotPanel({
			sessionId, useSession, useConversation, useSessions, renderFactorySlot,
		}) {
			const session = useSession((value) => value);
			const conversation = useConversation((value) => value);
			const active = conversation.activeTargets.size > 0
				|| (!session.blank && !session.awaitingFirstTurn)
				|| session.running;
			const shellPhase = active ? "active" : session.promptAttempted ? "engaging" : "blank";
			const summaryBlank = useSessions((state) => state.byId[sessionId]?.blank);
			const parentAvailabilityPending = session.subagent?.address.mode === "continuable"
				&& session.subagent.parentAvailable === undefined;
			const settling = (shellPhase === "blank" && session.openState === "loading" && summaryBlank !== true)
				|| parentAvailabilityPending;
			const hero = shellPhase === "blank" && (session.openState === "open" || summaryBlank === true);
			const phase = settling ? "settling" : hero ? "hero" : "active";
			return renderFactorySlot("conversation.content", { variant: "embedded", phase, hero }, {
				slots: { views: FixedChatConversationView },
			});
		}
		const sidebarChatCss = ".WfS_sidebarChatRoot{display:flex;width:100%;height:100%;min-width:0;min-height:0}";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"dsh-agent-team-whaleforce-sessions/SidebarChat.module.css\"]") === null) {
			const sidebarTag = document.createElement("style");
			sidebarTag.dataset.plugin = "dsh-agent-team-whaleforce-sessions";
			sidebarTag.dataset.pluginCss = "dsh-agent-team-whaleforce-sessions/SidebarChat.module.css";
			sidebarTag.textContent = sidebarChatCss;
			document.head.appendChild(sidebarTag);
		}
		/** Bind a chat resource's child reference around its Conversation slot. */
		function SidebarChatTab({ useResource, useTabInfo, SessionProvider, renderSlot }) {
			const { tab } = useTabInfo();
			const resource = useResource(tab.contentId);
			return h("div", { className: "WfS_sidebarChatRoot", "data-sidebar-chat": "" },
				resource.value === undefined
					? null
					: h(SessionProvider, { session: resource.value.reference },
						renderSlot("sidebar.chat.conversation", {})));
		}
		/**
		 * Register the chat resource owner and its right-Sidebar presentation.
		 * @param scope - Client root carrying Sessions, resources, Slots, and Sidebar registries.
		 * @param t - Chat namespace translator used for fallback tab titles.
		 */
		function registerSidebarChat(scope, t) {
			scope.effect(
				() => scope.resources.register(subagentChatResourceProvider(scope.sessions)),
				"ui-agent-team-whaleforce-sessions: Sidebar chat resources",
			);
			scope.effect(() => scope.sidebarRightTabs.register({
				id: SUBAGENT_CHAT_ID,
				kind: "subagentchat",
				patterns: [`${SUBAGENT_CHAT_ADDRESS}**`],
				priority: "builtin",
				canOpen: (address) => parseSubagentChatAddress(address) !== undefined,
				title: (address) => {
					const child = parseSubagentChatAddress(address)?.childSessionId;
					return child === undefined
						? t("sidebar.chat")
						: scope.sessions.list.getSnapshot().byId[child]?.projectionValues?.subagent?.label ?? child;
				},
			}), "ui-agent-team-whaleforce-sessions: Sidebar chat type");
			scope.effect(() => scope.slots.inject("sidebar.right.pane.tab", () => scope.slots.register({
				name: "sidebar.right.pane.tab",
				key: SUBAGENT_CHAT_ID,
				children: { "sidebar.chat.conversation": { kind: "single", scope: "session" } },
			}, SidebarChatTab)), "ui-agent-team-whaleforce-sessions: Sidebar chat body");
			scope.effect(() => scope.slots.inject("sidebar.chat.conversation", () => scope.slots.register({
				name: "sidebar.chat.conversation",
			}, ConversationSlotPanel)), "ui-agent-team-whaleforce-sessions: Sidebar Conversation");
		}
		//#endregion
		//#region lib/types/client/mount.js
		/** Source-safe Agent Teams sessions browser registration. */
		/** Required browser services for navigation, slots, locale, and the right Sidebar. */
		const inject = [
			"sessions",
			"uiWorkspace",
			"slots",
			"locale",
			"sidebarRight"
		];
		/**
		* Register the sessions locale dictionaries, the sidebar chat, and the
		* grouped catalog action. The catalog reads the shared Session store only;
		* this registration performs no Team RPC of its own.
		* @param ctx - Client Context carrying the injected navigation, locale, slot, Sidebar, and Session services.
		*/
		function registerAgentTeamSessionsUi(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-agent-team-whaleforce-sessions: dictionaries");
			ctx.inject(["resources", "sidebarRightTabs"], (scope) => {
				registerSidebarChat(scope, ctx.locale.bind(NS));
			});
			const catalogActions = (parentSessionId) => ({
				openChild(address) {
					ctx.uiWorkspace.openSession(address);
				},
				openChildAside(address) {
					ctx.sidebarRight.openResource(subagentChatAddress(address), {
						kind: "subagentchat",
						preferNewPane: true,
					});
				},
				refreshProjection(targetSessionId) {
					void ctx.sessions.refreshProjections(targetSessionId);
				},
			});
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "whaleforce-subagent-catalog",
				order: -30,
				locale: NS,
				inject: catalogActions,
			}, GroupedSubagentCatalog));
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Browser entry registering the grouped subagent-session catalog action. */
		/**
		* Register the sessions locale dictionaries, sidebar chat, and header action on the Client Context.
		* @param ctx - Client Context with the declared `inject` services available.
		*/
		function apply(ctx) {
			registerAgentTeamSessionsUi(ctx);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
