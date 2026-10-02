import assert from "node:assert/strict";
import { test } from "node:test";
import { parseServerStatuses } from "./server-status";

test("reads a connected server", () => {
	const output = "idea: http://127.0.0.1:64342/sse (SSE) - ✔ Connected";

	assert.deepEqual(parseServerStatuses(output), [{ name: "idea", health: "connected" }]);
});

test("reads a server that needs authentication", () => {
	const output = "claude.ai Asana: https://mcp.asana.com/v2/mcp - ! Needs authentication";

	assert.deepEqual(parseServerStatuses(output), [{ name: "claude.ai Asana", health: "needs-authentication" }]);
});

test("reads a server that failed to connect", () => {
	const output = "broken: http://localhost:9999/mcp - ✗ Failed to connect";

	assert.deepEqual(parseServerStatuses(output), [{ name: "broken", health: "failed" }]);
});

test("reads a server awaiting project approval", () => {
	const output = "team-server: https://mcp.example.com/mcp - ⏸ Pending approval";

	assert.deepEqual(parseServerStatuses(output), [{ name: "team-server", health: "pending-approval" }]);
});

test("keeps the whole name of a plugin-provided server", () => {
	const output = "plugin:figma:figma: https://mcp.figma.com/mcp (HTTP) - ! Needs authentication";

	assert.deepEqual(parseServerStatuses(output), [{ name: "plugin:figma:figma", health: "needs-authentication" }]);
});

test("ignores the health-check preamble and blank lines", () => {
	const output = ["Checking MCP server health…", "", "idea: http://127.0.0.1:64342/sse (SSE) - ✔ Connected", ""].join(
		"\n",
	);

	assert.deepEqual(parseServerStatuses(output), [{ name: "idea", health: "connected" }]);
});

test("reads no servers when none are configured", () => {
	assert.deepEqual(parseServerStatuses("No MCP servers configured. Run claude mcp add to add one."), []);
});

test("marks a status marker it does not recognize as unknown", () => {
	const output = "surprise: https://mcp.example.com/mcp - ☂ Reticulating splines";

	assert.deepEqual(parseServerStatuses(output), [{ name: "surprise", health: "unknown" }]);
});

test("reads every server in a multi-line listing", () => {
	const output = [
		"Checking MCP server health…",
		"",
		"claude.ai Slack: https://mcp.slack.com/mcp - ✔ Connected",
		"claude.ai Asana: https://mcp.asana.com/v2/mcp - ! Needs authentication",
		"broken: http://localhost:9999/mcp - ✗ Failed to connect",
	].join("\n");

	assert.deepEqual(
		parseServerStatuses(output).map(({ health }) => health),
		["connected", "needs-authentication", "failed"],
	);
});
