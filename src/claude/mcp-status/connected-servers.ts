import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ServerStatus } from "./server-status";

export const CONNECTED_SERVERS_FILE = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "connected-servers.json");

export function readConnectedServers(file = CONNECTED_SERVERS_FILE): Set<string> {
	try {
		return new Set(JSON.parse(fs.readFileSync(file, "utf8")));
	} catch {
		return new Set();
	}
}

export function rememberConnected(statuses: ServerStatus[], file = CONNECTED_SERVERS_FILE): void {
	const remembered = readConnectedServers(file);
	const sizeBefore = remembered.size;
	for (const { name, health } of statuses) if (health === "connected") remembered.add(name);
	if (remembered.size === sizeBefore) return;

	write([...remembered], file);
}

function write(names: string[], file: string): void {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const draft = `${file}.${process.pid}.draft`;
	fs.writeFileSync(draft, JSON.stringify(names));
	fs.renameSync(draft, file);
}
