import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Sessions } from "./session";
import { readSessions } from "./session-store";

const CLAUDE_SESSION_REGISTRY = path.join(os.homedir(), ".claude", "sessions");

type RegistryEntry = { pid: number; sessionId: string; startedAt: number };

export type LiveProcesses = Map<string, number>;

export function readLiveSessions(): Sessions {
	return onlyLive(readSessions(), liveProcesses(CLAUDE_SESSION_REGISTRY, isRunning));
}

export function liveProcesses(registryDir: string, isRunning: (pid: number) => boolean): LiveProcesses | undefined {
	if (!fs.existsSync(registryDir)) return undefined;

	const running = registryEntriesIn(registryDir).filter(({ pid }) => isRunning(pid));
	return new Map(running.map(({ sessionId, startedAt }) => [sessionId, startedAt]));
}

export function onlyLive(sessions: Sessions, live: LiveProcesses | undefined): Sessions {
	if (!live) return sessions;

	return Object.fromEntries(Object.entries(sessions).filter(([sessionId]) => live.has(sessionId)));
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

export function isRunning(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
