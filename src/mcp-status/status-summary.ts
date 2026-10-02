import type { ServerHealth, ServerStatus } from "./server-status";

export type Severity = "ok" | "warn" | "fail" | "unknown";

export type StatusSummary = { label: string; severity: Severity };

const SEGMENTS: ReadonlyArray<[ServerHealth, string]> = [
	["connected", "ok"],
	["needs-authentication", "auth"],
	["pending-approval", "pending"],
	["failed", "fail"],
	["unknown", "?"],
];

export function summarizeServerStatuses(statuses: ServerStatus[]): StatusSummary {
	if (statuses.length === 0) return { label: "none", severity: "unknown" };

	return { label: labelOf(statuses), severity: severityOf(statuses) };
}

function labelOf(statuses: ServerStatus[]): string {
	return SEGMENTS.map(([health, word]) => [countOf(statuses, health), word] as const)
		.filter(([count]) => count > 0)
		.map(([count, word]) => `${count} ${word}`)
		.join(" / ");
}

function severityOf(statuses: ServerStatus[]): Severity {
	if (statuses.some(({ health }) => health === "failed")) return "fail";
	if (statuses.every(({ health }) => health === "connected")) return "ok";

	return "warn";
}

function countOf(statuses: ServerStatus[], health: ServerHealth): number {
	return statuses.filter((status) => status.health === health).length;
}
