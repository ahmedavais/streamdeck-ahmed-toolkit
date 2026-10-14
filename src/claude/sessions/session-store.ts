import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Session, Sessions } from "./session";

export const SESSIONS_DIR = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "sessions");

export function readTurnState(sessionsDir = SESSIONS_DIR): Sessions {
	if (!fs.existsSync(sessionsDir)) return {};

	const sessions: Sessions = {};
	for (const name of sessionFilesIn(sessionsDir)) {
		const session = readSession(path.join(sessionsDir, name));
		if (session) sessions[path.basename(name, ".json")] = session;
	}
	return sessions;
}

function sessionFilesIn(sessionsDir: string): string[] {
	return fs.readdirSync(sessionsDir).filter((name) => name.endsWith(".json"));
}

function readSession(file: string): Session | undefined {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return undefined;
	}
}
