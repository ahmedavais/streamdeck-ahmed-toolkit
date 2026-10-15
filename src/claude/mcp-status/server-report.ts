import type { Log } from "../../infrastructure/log";
import type { ServerStatus } from "./server-status";

export class ServerReporter {
	private lastReport?: string;
	private lastLoggedAt = 0;

	constructor(
		private readonly log: Log,
		private readonly heartbeatMs: number,
		private readonly now: () => number = Date.now,
	) {}

	report(statuses: ServerStatus[]): void {
		const report = reportServers(statuses);
		if (!this.isWorthLogging(report)) return;

		this.log.info(report);
		this.lastReport = report;
		this.lastLoggedAt = this.now();
	}

	private isWorthLogging(report: string): boolean {
		return report !== this.lastReport || this.now() - this.lastLoggedAt >= this.heartbeatMs;
	}
}

export function reportServers(statuses: ServerStatus[]): string {
	if (statuses.length === 0) return "No MCP servers in use";

	const unhealthy = statuses.filter(({ health }) => health !== "connected");
	if (unhealthy.length === 0) return `MCP servers all connected: ${statuses.length}`;

	return `MCP servers not connected: ${unhealthy.map(({ name, health }) => `${name} (${health})`).join(", ")}`;
}
