import assert from "node:assert/strict";
import { test } from "node:test";
import type { ServerHealth } from "./server-status";
import { summarizeServerStatuses } from "./status-summary";

function statuses(...healths: ServerHealth[]) {
	return healths.map((health, index) => ({ name: `server-${index}`, health }));
}

test("everything connected reads as healthy", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "connected", "connected")), {
		label: "3 ok",
		severity: "ok",
	});
});

test("a server needing authentication is a warning", () => {
	assert.deepEqual(
		summarizeServerStatuses(statuses("connected", "connected", "connected", "connected", "connected", "connected", "needs-authentication")),
		{ label: "6 ok / 1 auth", severity: "warn" },
	);
});

test("a server awaiting approval is a warning", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "pending-approval")), {
		label: "1 ok / 1 pending",
		severity: "warn",
	});
});

test("a failure outranks a server needing authentication", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "needs-authentication", "failed")), {
		label: "1 ok / 1 auth / 1 fail",
		severity: "fail",
	});
});

test("an unrecognized status is surfaced as a warning", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "unknown")), {
		label: "1 ok / 1 ?",
		severity: "warn",
	});
});

test("no configured servers is neither healthy nor broken", () => {
	assert.deepEqual(summarizeServerStatuses([]), { label: "none", severity: "unknown" });
});
