import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Turn, TurnStateFile } from "./turn-state";

export const SESSIONS_DIR = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "sessions");

export function readTurnState(sessionsDir = SESSIONS_DIR): TurnStateFile {
	if (!fs.existsSync(sessionsDir)) return {};

	const turns: TurnStateFile = {};
	for (const name of sessionFilesIn(sessionsDir)) {
		const turn = readTurn(path.join(sessionsDir, name));
		if (turn) turns[path.basename(name, ".json")] = turn;
	}
	return turns;
}

function sessionFilesIn(sessionsDir: string): string[] {
	return fs.readdirSync(sessionsDir).filter((name) => name.endsWith(".json"));
}

function readTurn(file: string): Turn | undefined {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return undefined;
	}
}
