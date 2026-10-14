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

test("a server needing authentication is named as a warning", () => {
	assert.deepEqual(
		summarizeServerStatuses(statuses("connected", "connected", "connected", "connected", "connected", "connected", "needs-authentication")),
		{ label: "server-6\nauth", severity: "warn" },
	);
});

test("a server awaiting approval is named as a warning", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "pending-approval")), {
		label: "server-1\npending",
		severity: "warn",
	});
});

test("a failure outranks a server needing authentication", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "needs-authentication", "failed")), {
		label: "server-2\nfail +1",
		severity: "fail",
	});
});

test("a server with an unrecognized status is named as a warning", () => {
	assert.deepEqual(summarizeServerStatuses(statuses("connected", "unknown")), {
		label: "server-1\n?",
		severity: "warn",
	});
});

test("an unrecognized status outranks needing authentication", () => {
	assert.equal(summarizeServerStatuses(statuses("needs-authentication", "unknown")).label, "server-1\n? +1");
});

test("needing authentication outranks awaiting approval", () => {
	assert.equal(summarizeServerStatuses(statuses("pending-approval", "needs-authentication")).label, "server-1\nauth +1");
});

test("the first listed wins among servers with the same health", () => {
	assert.equal(summarizeServerStatuses(statuses("failed", "failed")).label, "server-0\nfail +1");
});

test("no configured servers is neither healthy nor broken", () => {
	assert.deepEqual(summarizeServerStatuses([]), { label: "none", severity: "unknown" });
});
