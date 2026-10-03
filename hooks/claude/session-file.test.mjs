import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { startTurn } from "./session-file.mjs";

test("starting a turn records when it started", () => {
	const sessionsDir = temporarySessionsDir();

	startTurn(sessionsDir, "session-a", 1_000);

	assert.deepEqual(sessionFiles(sessionsDir), { "session-a.json": { turnStartedAt: 1_000 } });
});

function temporarySessionsDir() {
	return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-sessions-")), "sessions");
}

function sessionFiles(sessionsDir) {
	if (!fs.existsSync(sessionsDir)) return {};
	return Object.fromEntries(fs.readdirSync(sessionsDir).map((name) => [name, JSON.parse(fs.readFileSync(path.join(sessionsDir, name), "utf8"))]));
}
