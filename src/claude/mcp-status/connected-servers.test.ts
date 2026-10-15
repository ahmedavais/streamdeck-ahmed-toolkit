import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readConnectedServers, rememberConnected } from "./connected-servers";

test("remembers servers that connected", () => {
	const file = freshFile();

	rememberConnected([{ name: "Slack", health: "connected" }], file);

	assert.deepEqual(readConnectedServers(file), new Set(["Slack"]));
});

test("remembers only servers that are connected", () => {
	const file = freshFile();

	rememberConnected(
		[
			{ name: "Slack", health: "connected" },
			{ name: "Drata", health: "needs-authentication" },
		],
		file,
	);

	assert.deepEqual(readConnectedServers(file), new Set(["Slack"]));
});

test("keeps servers remembered earlier", () => {
	const file = freshFile();
	rememberConnected([{ name: "Slack", health: "connected" }], file);

	rememberConnected([{ name: "Miro", health: "connected" }], file);

	assert.deepEqual(readConnectedServers(file), new Set(["Slack", "Miro"]));
});

test("remembers a server after it stops being connected", () => {
	const file = freshFile();
	rememberConnected([{ name: "Slack", health: "connected" }], file);

	rememberConnected([{ name: "Slack", health: "needs-authentication" }], file);

	assert.deepEqual(readConnectedServers(file), new Set(["Slack"]));
});

test("remembers nothing when no memory file exists yet", () => {
	assert.deepEqual(readConnectedServers(freshFile()), new Set());
});

test("remembers nothing when the memory file can't be parsed", () => {
	const file = freshFile();
	fs.writeFileSync(file, "{ not json");

	assert.deepEqual(readConnectedServers(file), new Set());
});

function freshFile(): string {
	return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-mcp-")), "connected-servers.json");
}
