import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Turn, TurnStateFile } from "./turn-state";

export const SESSIONS_DIR = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "sessions");

export function readTurnState(sessionsDir = SESSIONS_DIR): TurnStateFile {
	if (!fs.existsSync(sessionsDir)) return {};

	return Object.fromEntries(
		fs.readdirSync(sessionsDir).map((name) => [path.basename(name, ".json"), readTurn(path.join(sessionsDir, name))]),
	);
}

function readTurn(file: string): Turn {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}
