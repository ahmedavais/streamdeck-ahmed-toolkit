import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const STATE_DIR = path.join(os.homedir(), ".streamdeck-claude-status");
export const STATE_FILE = path.join(STATE_DIR, "session-turns.json");

export function readState() {
	try {
		return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
	} catch {
		return {};
	}
}

export function writeState(state) {
	fs.mkdirSync(STATE_DIR, { recursive: true });
	fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

export function readStdin() {
	return new Promise((resolve) => {
		let data = "";
		process.stdin.on("data", (chunk) => (data += chunk));
		process.stdin.on("end", () => resolve(data));
	});
}
