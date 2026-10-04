import { CommandRunner, type CommandResult } from "../../infrastructure/command-runner";
import { claudeCli } from "./claude-cli";
import { parseServerStatuses, type ServerStatus } from "./server-status";

const PROBE_TIMEOUT_MS = 40 * 1000;

export class McpStatusProbe {
	static create(): McpStatusProbe {
		return new McpStatusProbe(CommandRunner.create(), claudeCli);
	}

	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
	) {}

	async serverStatuses(): Promise<ServerStatus[]> {
		const listing = await this.runner.run(this.locateCli(), ["mcp", "list"], PROBE_TIMEOUT_MS);
		if (listing.exitCode !== 0 && listing.stdout.length === 0) throw new Error(emptyListingFailure(listing));

		return parseServerStatuses(listing.stdout);
	}
}

function emptyListingFailure({ exitCode, timedOut }: CommandResult): string {
	if (timedOut) return `claude mcp list printed nothing before timing out after ${PROBE_TIMEOUT_MS / 1000}s`;
	return `claude mcp list exited with code ${exitCode} and printed nothing`;
}
