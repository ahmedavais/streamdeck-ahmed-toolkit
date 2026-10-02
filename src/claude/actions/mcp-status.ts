import streamDeck, {
	action,
	KeyAction,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";
import { renderStateImage } from "../../key-image/state-image";
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
export class McpStatus extends SingletonAction {
	private timer: NodeJS.Timeout | undefined;
	private probeInFlight = false;

	override onWillAppear(ev: WillAppearEvent): void {
		if (!ev.action.isKey()) return;

		this.recheck();

		if (!this.timer) {
			this.timer = setInterval(() => this.recheck(), POLL_INTERVAL_MS);
		}
	}

	override onWillDisappear(_ev: WillDisappearEvent): void {
		if (this.actions.next().done) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	override onKeyDown(ev: KeyDownEvent): void {
		if (ev.action.isKey()) ev.action.setTitle(CHECKING_TITLE);

		this.recheck();
	}

	private async recheck(): Promise<void> {
		if (this.probeInFlight) return;
		this.probeInFlight = true;

		try {
			const statuses = await probeMcpServers();
			this.report(statuses);
			this.show(summarizeServerStatuses(statuses));
		} catch (failure) {
			streamDeck.logger.error("Could not read MCP server health", failure);
			this.show(UNREACHABLE);
		} finally {
			this.probeInFlight = false;
		}
	}

	private report(statuses: ServerStatus[]): void {
		const unhealthy = statuses.filter(({ health }) => health !== "connected");
		if (unhealthy.length === 0) return;

		streamDeck.logger.info(`MCP servers not connected: ${unhealthy.map(({ name, health }) => `${name} (${health})`).join(", ")}`);
	}

	private show({ label, severity }: StatusSummary): void {
		for (const visibleAction of this.actions) {
			if (!visibleAction.isKey()) continue;

			this.paint(visibleAction, label, severity);
		}
	}

	private paint(action: KeyAction, label: string, severity: Severity): void {
		action.setTitle(label);
		action.setImage(renderStateImage(COLOR_BY_SEVERITY[severity]));
	}
}
