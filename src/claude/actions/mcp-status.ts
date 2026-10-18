import { action, KeyDownEvent } from "@elgato/streamdeck";
import { Log } from "../../infrastructure/log";
import { renderStateImage } from "../../key-image/state-image";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { readConnectedServers, rememberConnected } from "../mcp-status/connected-servers";
import { McpStatusProbe } from "../mcp-status/mcp-status-probe";
import { ServerReporter } from "../mcp-status/server-report";
import type { ServerStatus } from "../mcp-status/server-status";
import { withoutUnusedServers } from "../mcp-status/unused-servers";
import { summarizeServerStatuses, type Severity, type StatusSummary } from "../mcp-status/status-summary";

const POLL_INTERVAL_MS = 45 * 1000;
const HEARTBEAT_MS = 60 * 60 * 1000;
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
	private readonly probe = McpStatusProbe.create();
	private readonly reporter = new ServerReporter(this.log, HEARTBEAT_MS);

	constructor() {
		super({ name: "MCP status", everyMs: POLL_INTERVAL_MS, failedDisplay: displayFor(UNREACHABLE) });
	}

	override onKeyDown(ev: KeyDownEvent): void {
		if (ev.action.isKey()) void ev.action.setTitle(CHECKING_TITLE);

		this.pollNow();
	}

	protected override async check(): Promise<KeyDisplay> {
		const statuses = await this.probe.serverStatuses();
		this.remember(statuses);
		const serversInUse = withoutUnusedServers(statuses, readConnectedServers());
		this.reporter.report(serversInUse);
		return displayFor(summarizeServerStatuses(serversInUse));
	}

	private remember(statuses: ServerStatus[]): void {
		try {
			rememberConnected(statuses);
		} catch (failure) {
			this.log.error(`Could not remember connected MCP servers: ${(failure as Error).message}`);
		}
	}
}

function displayFor({ label, severity }: StatusSummary): KeyDisplay {
	return { title: label, image: renderStateImage(COLOR_BY_SEVERITY[severity]) };
}
