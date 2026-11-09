import os from "node:os";
import { CommandRunner, type CommandResult } from "../../infrastructure/command-runner";
import { claudeCli } from "../claude-cli";
import { toolDirectories } from "../tool-directories";
import { parseServerStatuses, type ServerStatus } from "./server-status";

const PROBE_TIMEOUT_MS = 40 * 1000;

export class McpStatusProbe {
	static create(): McpStatusProbe {
		return new McpStatusProbe(CommandRunner.create(), claudeCli, toolDirectories(os.homedir()));
	}

	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
		private readonly toolDirectories: string[],
	) {}

	async serverStatuses(): Promise<ServerStatus[]> {
		const listing = await this.runner.run(this.locateCli(), ["mcp", "list"], {
			timeoutMs: PROBE_TIMEOUT_MS,
			pathPrefix: this.toolDirectories,
		});
		const statuses = parseServerStatuses(listing.stdout);
		if (listing.exitCode !== 0 && statuses.length === 0) throw new Error(emptyListingFailure(listing));

		return statuses;
	}
}

function emptyListingFailure({ exitCode, timedOut }: CommandResult): string {
	if (timedOut) return `claude mcp list printed no servers before timing out after ${PROBE_TIMEOUT_MS / 1000}s`;
	return `claude mcp list exited with code ${exitCode} and printed no servers`;
}
