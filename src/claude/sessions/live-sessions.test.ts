import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { isRunning, liveProcesses, onlyLive } from "./live-sessions";

test("lists when each running session's Claude Code process started", () => {
	const registryDir = registryHolding({ "5011.json": { pid: 5011, sessionId: "session-a", startedAt: 1_000 } });

	assert.deepEqual(liveProcesses(registryDir, () => true), new Map([["session-a", 1_000]]));
});

test("leaves out a session whose process has exited", () => {
	const registryDir = registryHolding({
		"5011.json": { pid: 5011, sessionId: "session-running", startedAt: 1_000 },
		"4242.json": { pid: 4242, sessionId: "session-exited", startedAt: 2_000 },
	});

	assert.deepEqual(liveProcesses(registryDir, (pid) => pid === 5011), new Map([["session-running", 1_000]]));
});

test("skips a registry entry it can't parse", () => {
	const registryDir = registryHolding({
		"5011.json": { pid: 5011, sessionId: "session-a", startedAt: 1_000 },
		"4242.json": "{ not json",
	});

	assert.deepEqual(liveProcesses(registryDir, () => true), new Map([["session-a", 1_000]]));
});

test("liveness is unknown when the registry folder doesn't exist", () => {
	const missingDir = path.join(os.tmpdir(), "toolkit-registry-that-was-never-created");

	assert.equal(liveProcesses(missingDir, () => true), undefined);
});

test("keeps only live sessions", () => {
	const sessions = { "session-live": { turnStartedAt: 1_000 }, "session-dead": { turnStartedAt: 2_000 } };

	assert.deepEqual(onlyLive(sessions, new Map([["session-live", 500]])), { "session-live": { turnStartedAt: 1_000 } });
});

test("keeps every session when liveness is unknown", () => {
	const sessions = { "session-a": { turnStartedAt: 1_000 }, "session-b": { turnStartedAt: 2_000 } };

	assert.deepEqual(onlyLive(sessions, undefined), sessions);
});

test("the current process is running", () => {
	assert.equal(isRunning(process.pid), true);
});

test("a process that has exited isn't running", async () => {
	const exited = spawn(process.execPath, ["-e", ""]);
	await once(exited, "exit");

	assert.equal(isRunning(exited.pid!), false);
});

test("forgets waiting recorded before the session's process started", () => {
	const sessions = { "session-resumed": { turnStartedAt: 1_000, waiting: { for: "permission" as const, since: 2_000 } } };

	assert.deepEqual(onlyLive(sessions, new Map([["session-resumed", 5_000]])), { "session-resumed": { turnStartedAt: 1_000 } });
});

function registryHolding(files: Record<string, unknown>): string {
	const registryDir = fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-registry-"));
	for (const [name, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(registryDir, name), typeof content === "string" ? content : JSON.stringify(content));
	}
	return registryDir;
}
