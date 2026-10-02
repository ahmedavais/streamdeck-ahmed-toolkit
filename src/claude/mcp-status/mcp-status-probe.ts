import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { claudeCli } from "./claude-cli";
import { parseServerStatuses, type ServerStatus } from "./server-status";

const PROBE_TIMEOUT_MS = 40 * 1000;

const runCommand = promisify(execFile);

export async function probeMcpServers(): Promise<ServerStatus[]> {
	try {
		const { stdout } = await runCommand(claudeCli(), ["mcp", "list"], { timeout: PROBE_TIMEOUT_MS });
		return parseServerStatuses(stdout);
	} catch (failure) {
		return parseServerStatuses(listingSalvagedFrom(failure));
	}
}

function listingSalvagedFrom(failure: unknown): string {
	const stdout = (failure as { stdout?: unknown })?.stdout;
	if (typeof stdout === "string" && stdout.length > 0) return stdout;

	throw failure;
}
