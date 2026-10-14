import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { liveSessionIds } from "./live-sessions";

test("lists the sessions whose Claude Code process is running", () => {
	const registryDir = registryHolding({ "5011.json": { pid: 5011, sessionId: "session-a" } });

	assert.deepEqual(liveSessionIds(registryDir, () => true), new Set(["session-a"]));
});

function registryHolding(files: Record<string, unknown>): string {
	const registryDir = fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-registry-"));
	for (const [name, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(registryDir, name), typeof content === "string" ? content : JSON.stringify(content));
	}
	return registryDir;
}
