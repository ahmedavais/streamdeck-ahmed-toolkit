import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRunner, type NulledCommandResult } from "../../infrastructure/command-runner";
import { McpStatusProbe } from "./mcp-status-probe";

const IRRELEVANT_LISTING: NulledCommandResult = { stdout: "", exitCode: 0, timedOut: false };

test("runs `mcp list` on the located claude CLI with a 40s timeout", async () => {
	const { commands } = await probe({ cli: "/Users/someone/.local/bin/claude" });

	assert.deepEqual(commands.data, [{ command: "/Users/someone/.local/bin/claude", args: ["mcp", "list"], timeoutMs: 40_000 }]);
});

const TWO_SERVERS = [
	"idea: http://127.0.0.1:64342/sse (SSE) - ✔ Connected",
	"claude.ai Asana: https://mcp.asana.com/v2/mcp - ! Needs authentication",
].join("\n");

test("reads server statuses from a successful listing", async () => {
	const { statuses } = await probe({ listing: { stdout: TWO_SERVERS, exitCode: 0, timedOut: false } });

	assert.deepEqual(statuses, [
		{ name: "idea", health: "connected" },
		{ name: "claude.ai Asana", health: "needs-authentication" },
	]);
});

test("fails clearly when the listing exits with no output", async () => {
	await assert.rejects(probe({ listing: { stdout: "", exitCode: 1, timedOut: false } }), {
		message: "claude mcp list exited with code 1 and printed nothing",
	});
});

async function probe({ cli = "/irrelevant/claude", listing = IRRELEVANT_LISTING } = {}) {
	const runner = CommandRunner.createNull(listing);
	const commands = runner.trackCommands();
	const statuses = await new McpStatusProbe(runner, () => cli).serverStatuses();
	return { statuses, commands };
}
