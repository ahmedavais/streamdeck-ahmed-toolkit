import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { endTurn, startTurn } from "./session-file.mjs";

test("starting a turn records when it started", () => {
	const sessionsDir = temporarySessionsDir();

	startTurn(sessionsDir, "session-a", 1_000);

	assert.deepEqual(sessionFiles(sessionsDir), { "session-a.json": { turnStartedAt: 1_000 } });
});

test("ending a turn records when it ended", () => {
	const sessionsDir = temporarySessionsDir();
	startTurn(sessionsDir, "session-a", 1_000);

	endTurn(sessionsDir, "session-a", 4_000);

	assert.deepEqual(sessionFiles(sessionsDir), { "session-a.json": { turnStartedAt: 1_000, turnEndedAt: 4_000 } });
});

test("ending a turn for an unknown session does nothing", () => {
	const sessionsDir = temporarySessionsDir();

	endTurn(sessionsDir, "never-started", 4_000);

	assert.deepEqual(sessionFiles(sessionsDir), {});
});

function temporarySessionsDir() {
	return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-sessions-")), "sessions");
}

function sessionFiles(sessionsDir) {
	if (!fs.existsSync(sessionsDir)) return {};
	return Object.fromEntries(fs.readdirSync(sessionsDir).map((name) => [name, JSON.parse(fs.readFileSync(path.join(sessionsDir, name), "utf8"))]));
}
