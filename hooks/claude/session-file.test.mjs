import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readTurnState, SESSIONS_DIR as PLUGIN_SESSIONS_DIR } from "../../src/claude/active-task/turn-store.ts";
import { endSession, endTurn, SESSIONS_DIR, startTurn } from "./session-file.mjs";

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

test("starting a new turn replaces the previous turn's timings", () => {
	const sessionsDir = temporarySessionsDir();
	startTurn(sessionsDir, "session-a", 1_000);
	endTurn(sessionsDir, "session-a", 4_000);

	startTurn(sessionsDir, "session-a", 9_000);

	assert.deepEqual(sessionFiles(sessionsDir), { "session-a.json": { turnStartedAt: 9_000 } });
});

test("ending a session removes its file", () => {
	const sessionsDir = temporarySessionsDir();
	startTurn(sessionsDir, "session-a", 1_000);
	startTurn(sessionsDir, "session-b", 2_000);

	endSession(sessionsDir, "session-a");

	assert.deepEqual(sessionFiles(sessionsDir), { "session-b.json": { turnStartedAt: 2_000 } });
});

test("ending an unknown session does nothing", () => {
	const sessionsDir = temporarySessionsDir();

	endSession(sessionsDir, "never-started");

	assert.deepEqual(sessionFiles(sessionsDir), {});
});

test("leaves no draft files behind", () => {
	const sessionsDir = temporarySessionsDir();

	startTurn(sessionsDir, "session-a", 1_000);
	endTurn(sessionsDir, "session-a", 4_000);

	assert.deepEqual(fs.readdirSync(sessionsDir), ["session-a.json"]);
});

test("the hooks write where the plugin reads", () => {
	assert.equal(SESSIONS_DIR, PLUGIN_SESSIONS_DIR);
});

test("the plugin reads the turns the hooks write", () => {
	const sessionsDir = temporarySessionsDir();

	startTurn(sessionsDir, "session-a", 1_000);
	endTurn(sessionsDir, "session-a", 4_000);
	startTurn(sessionsDir, "session-b", 2_000);

	assert.deepEqual(readTurnState(sessionsDir), {
		"session-a": { turnStartedAt: 1_000, turnEndedAt: 4_000 },
		"session-b": { turnStartedAt: 2_000 },
	});
});

test("concurrent sessions keep their own turns", async () => {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-home-"));
	const sessionIds = Array.from({ length: 20 }, (_, index) => `session-${index}`);

	await Promise.all(sessionIds.map((sessionId) => runHook("turn-started.mjs", { session_id: sessionId }, home)));

	const sessionsDir = path.join(home, ".streamdeck-ahmed-toolkit", "sessions");
	assert.deepEqual(Object.keys(sessionFiles(sessionsDir)).sort(), sessionIds.map((sessionId) => `${sessionId}.json`).sort());
});

function runHook(script, input, home) {
	const scriptPath = fileURLToPath(new URL(script, import.meta.url));
	return new Promise((resolve, reject) => {
		const child = execFile("node", [scriptPath], { env: { ...process.env, HOME: home } }, (failure) => (failure ? reject(failure) : resolve()));
		child.stdin.end(JSON.stringify(input));
	});
}

function temporarySessionsDir() {
	return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-sessions-")), "sessions");
}

function sessionFiles(sessionsDir) {
	if (!fs.existsSync(sessionsDir)) return {};
	return Object.fromEntries(fs.readdirSync(sessionsDir).map((name) => [name, JSON.parse(fs.readFileSync(path.join(sessionsDir, name), "utf8"))]));
}
