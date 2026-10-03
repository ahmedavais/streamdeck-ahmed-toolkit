import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readTurnState } from "./turn-store";

test("reads every session's turn", () => {
	const sessionsDir = sessionsDirHolding({
		"session-a.json": JSON.stringify({ turnStartedAt: 1_000 }),
		"session-b.json": JSON.stringify({ turnStartedAt: 2_000, turnEndedAt: 5_000 }),
	});

	assert.deepEqual(readTurnState(sessionsDir), {
		"session-a": { turnStartedAt: 1_000 },
		"session-b": { turnStartedAt: 2_000, turnEndedAt: 5_000 },
	});
});

test("reads nothing when the folder doesn't exist", () => {
	const missingDir = path.join(os.tmpdir(), "toolkit-sessions-that-were-never-created");

	assert.deepEqual(readTurnState(missingDir), {});
});

test("ignores files that aren't session files", () => {
	const sessionsDir = sessionsDirHolding({
		"session-a.json": JSON.stringify({ turnStartedAt: 1_000 }),
		".session-b.4242.draft": JSON.stringify({ turnStartedAt: 2_000 }),
	});

	assert.deepEqual(readTurnState(sessionsDir), { "session-a": { turnStartedAt: 1_000 } });
});

test("skips a session file it can't parse", () => {
	const sessionsDir = sessionsDirHolding({
		"session-a.json": JSON.stringify({ turnStartedAt: 1_000 }),
		"session-b.json": "{ not json",
	});

	assert.deepEqual(readTurnState(sessionsDir), { "session-a": { turnStartedAt: 1_000 } });
});

function sessionsDirHolding(files: Record<string, string>): string {
	const sessionsDir = fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-sessions-"));
	for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(sessionsDir, name), content);
	return sessionsDir;
}
