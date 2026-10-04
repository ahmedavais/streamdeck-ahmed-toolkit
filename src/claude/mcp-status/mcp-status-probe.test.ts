import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRunner, type NulledCommandResult } from "../../infrastructure/command-runner";
import { McpStatusProbe } from "./mcp-status-probe";

const IRRELEVANT_LISTING: NulledCommandResult = { stdout: "", exitCode: 0, timedOut: false };

test("runs `mcp list` on the located claude CLI with a 40s timeout", async () => {
	const { commands } = await probe({ cli: "/Users/someone/.local/bin/claude" });

	assert.deepEqual(commands.data, [{ command: "/Users/someone/.local/bin/claude", args: ["mcp", "list"], timeoutMs: 40_000 }]);
});

async function probe({ cli = "/irrelevant/claude", listing = IRRELEVANT_LISTING } = {}) {
	const runner = CommandRunner.createNull(listing);
	const commands = runner.trackCommands();
	const statuses = await new McpStatusProbe(runner, () => cli).serverStatuses();
	return { statuses, commands };
}
