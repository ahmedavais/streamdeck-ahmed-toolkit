import type { ServerStatus } from "./server-status";

export function withoutUnusedServers(statuses: ServerStatus[], everConnected: Set<string>): ServerStatus[] {
	return statuses.filter((status) => !isUnused(status, everConnected));
}

function isUnused({ name, health }: ServerStatus, everConnected: Set<string>): boolean {
	return health === "disabled" || (health === "needs-authentication" && !everConnected.has(name));
}
