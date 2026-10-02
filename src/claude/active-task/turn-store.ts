import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { TurnStateFile } from "./turn-state";

const STATE_FILE = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "session-turns.json");

export function readTurnState(): TurnStateFile {
	try {
		return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
	} catch {
		return {};
	}
}
