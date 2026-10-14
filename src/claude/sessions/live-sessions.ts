import fs from "node:fs";
import path from "node:path";
import type { Sessions } from "./session";

type RegistryEntry = { pid: number; sessionId: string };

export function liveSessionIds(registryDir: string, isRunning: (pid: number) => boolean): Set<string> | undefined {
	if (!fs.existsSync(registryDir)) return undefined;

	const running = registryEntriesIn(registryDir).filter(({ pid }) => isRunning(pid));
	return new Set(running.map(({ sessionId }) => sessionId));
}

export function onlyLive(sessions: Sessions, liveIds: Set<string> | undefined): Sessions {
	if (!liveIds) return sessions;

	return Object.fromEntries(Object.entries(sessions).filter(([sessionId]) => liveIds.has(sessionId)));
}

function registryEntriesIn(registryDir: string): RegistryEntry[] {
	return fs
		.readdirSync(registryDir)
		.filter((name) => name.endsWith(".json"))
		.flatMap((name) => {
			const entry = readEntry(path.join(registryDir, name));
			return entry ? [entry] : [];
		});
}

function readEntry(file: string): RegistryEntry | undefined {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return undefined;
	}
}
