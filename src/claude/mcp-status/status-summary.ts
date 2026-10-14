import type { ServerHealth, ServerStatus } from "./server-status";

export type Severity = "ok" | "warn" | "fail" | "unknown";

export type StatusSummary = { label: string; severity: Severity };

const WORD_FOR: Record<ServerHealth, string> = {
	connected: "ok",
	"needs-authentication": "auth",
	"pending-approval": "pending",
	failed: "fail",
	unknown: "?",
};

const WORST_FIRST: ServerHealth[] = ["failed", "unknown", "needs-authentication", "pending-approval"];

export function summarizeServerStatuses(statuses: ServerStatus[]): StatusSummary {
	if (statuses.length === 0) return { label: "none", severity: "unknown" };

	return { label: labelOf(statuses), severity: severityOf(statuses) };
}

function labelOf(statuses: ServerStatus[]): string {
	const unhealthy = unhealthyWorstFirst(statuses);
	if (unhealthy.length === 0) return `${statuses.length} ${WORD_FOR.connected}`;

	return worstServerLabel(unhealthy);
}

function unhealthyWorstFirst(statuses: ServerStatus[]): ServerStatus[] {
	return statuses.filter(({ health }) => health !== "connected").sort(byWorstFirst);
}

function worstServerLabel([worst, ...others]: ServerStatus[]): string {
	const more = others.length > 0 ? ` +${others.length}` : "";
	return `${worst.name}\n${WORD_FOR[worst.health]}${more}`;
}

function byWorstFirst(first: ServerStatus, second: ServerStatus): number {
	return WORST_FIRST.indexOf(first.health) - WORST_FIRST.indexOf(second.health);
}

function severityOf(statuses: ServerStatus[]): Severity {
	if (statuses.some(({ health }) => health === "failed")) return "fail";
	if (statuses.every(({ health }) => health === "connected")) return "ok";

	return "warn";
}
