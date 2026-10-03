import { action, KeyDownEvent } from "@elgato/streamdeck";
import { Log } from "../../infrastructure/log";
import { renderStateImage } from "../../key-image/state-image";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { probeMcpServers } from "../mcp-status/mcp-status-probe";
import type { ServerStatus } from "../mcp-status/server-status";
import { summarizeServerStatuses, type Severity, type StatusSummary } from "../mcp-status/status-summary";

const POLL_INTERVAL_MS = 45 * 1000;
const CHECKING_TITLE = "…";
const UNREACHABLE: StatusSummary = { label: "?", severity: "unknown" };

const COLOR_BY_SEVERITY: Record<Severity, string> = {
	ok: "#2f7d4f",
	warn: "#c08a1e",
	fail: "#b3312c",
	unknown: "#3a3a42",
};

@action({ UUID: "com.ahmedavais.toolkit.claude.mcp-status" })
export class McpStatus extends PollingKeyAction {
	private readonly log = Log.create();

	constructor() {
		super({ name: "MCP status", everyMs: POLL_INTERVAL_MS, failedDisplay: displayFor(UNREACHABLE) });
	}

	override onKeyDown(ev: KeyDownEvent): void {
		if (ev.action.isKey()) ev.action.setTitle(CHECKING_TITLE);

		this.pollNow();
	}

	protected override async check(): Promise<KeyDisplay> {
		const statuses = await probeMcpServers();
		this.report(statuses);
		return displayFor(summarizeServerStatuses(statuses));
	}

	private report(statuses: ServerStatus[]): void {
		const unhealthy = statuses.filter(({ health }) => health !== "connected");
		if (unhealthy.length === 0) return;

		this.log.info(`MCP servers not connected: ${unhealthy.map(({ name, health }) => `${name} (${health})`).join(", ")}`);
	}
}

function displayFor({ label, severity }: StatusSummary): KeyDisplay {
	return { title: label, image: renderStateImage(COLOR_BY_SEVERITY[severity]) };
}
