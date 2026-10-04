import { execFile } from "node:child_process";
import type { CommandRunner } from "../../infrastructure/command-runner";
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

export class McpStatusProbe {
	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
	) {}

	async serverStatuses(): Promise<ServerStatus[]> {
		await this.runner.run(this.locateCli(), ["mcp", "list"], PROBE_TIMEOUT_MS);
		return [];
	}
}
