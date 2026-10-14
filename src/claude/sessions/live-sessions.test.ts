import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { liveSessionIds, onlyLive } from "./live-sessions";

test("lists the sessions whose Claude Code process is running", () => {
	const registryDir = registryHolding({ "5011.json": { pid: 5011, sessionId: "session-a" } });

	assert.deepEqual(liveSessionIds(registryDir, () => true), new Set(["session-a"]));
});

test("leaves out a session whose process has exited", () => {
	const registryDir = registryHolding({
		"5011.json": { pid: 5011, sessionId: "session-running" },
		"4242.json": { pid: 4242, sessionId: "session-exited" },
	});

	assert.deepEqual(liveSessionIds(registryDir, (pid) => pid === 5011), new Set(["session-running"]));
});

test("skips a registry entry it can't parse", () => {
	const registryDir = registryHolding({
		"5011.json": { pid: 5011, sessionId: "session-a" },
		"4242.json": "{ not json",
	});

	assert.deepEqual(liveSessionIds(registryDir, () => true), new Set(["session-a"]));
});

test("liveness is unknown when the registry folder doesn't exist", () => {
	const missingDir = path.join(os.tmpdir(), "toolkit-registry-that-was-never-created");

	assert.equal(liveSessionIds(missingDir, () => true), undefined);
});

test("keeps only live sessions", () => {
	const sessions = { "session-live": { turnStartedAt: 1_000 }, "session-dead": { turnStartedAt: 2_000 } };

	assert.deepEqual(onlyLive(sessions, new Set(["session-live"])), { "session-live": { turnStartedAt: 1_000 } });
});

function registryHolding(files: Record<string, unknown>): string {
	const registryDir = fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-registry-"));
	for (const [name, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(registryDir, name), typeof content === "string" ? content : JSON.stringify(content));
	}
	return registryDir;
}
