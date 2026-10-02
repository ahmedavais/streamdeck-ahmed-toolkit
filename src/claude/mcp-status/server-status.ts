export type ServerHealth = "connected" | "needs-authentication" | "pending-approval" | "failed" | "unknown";

export type ServerStatus = { name: string; health: ServerHealth };

const STATUS_SEPARATOR = " - ";

// `claude mcp list` has no machine-readable output flag as of Claude Code 2.1.277, so these
// statuses are read from its human-readable text. The status symbols and wording are not a
// published contract and may change between Claude Code versions; if they do, an unrecognized
// marker parses as "unknown" (surfaced on the key as "?") and these phrases need updating.
const HEALTH_BY_PHRASE: ReadonlyArray<[string, ServerHealth]> = [
	["connected", "connected"],
	["needs authentication", "needs-authentication"],
	["pending approval", "pending-approval"],
	["failed to connect", "failed"],
];

export function parseServerStatuses(output: string): ServerStatus[] {
	return output.split("\n").flatMap((line) => {
		const status = parseLine(line);
		return status ? [status] : [];
	});
}

function parseLine(line: string): ServerStatus | undefined {
	const separatorAt = line.lastIndexOf(STATUS_SEPARATOR);
	if (separatorAt < 0) return undefined;

	const name = nameOf(line.slice(0, separatorAt));
	if (!name) return undefined;

	return { name, health: healthOf(line.slice(separatorAt + STATUS_SEPARATOR.length)) };
}

function nameOf(beforeSeparator: string): string | undefined {
	const urlAt = beforeSeparator.lastIndexOf(": ");
	return urlAt > 0 ? beforeSeparator.slice(0, urlAt) : undefined;
}

function healthOf(marker: string): ServerHealth {
	const spoken = marker.toLowerCase();
	const match = HEALTH_BY_PHRASE.find(([phrase]) => spoken.includes(phrase));

	return match ? match[1] : "unknown";
}
