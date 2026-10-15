import assert from "node:assert/strict";
import { test } from "node:test";
import { withoutUnusedServers } from "./unused-servers";

test("keeps a server that needs authentication after having connected", () => {
	const statuses = [{ name: "Slack", health: "needs-authentication" as const }];

	assert.deepEqual(withoutUnusedServers(statuses, new Set(["Slack"])), statuses);
});

test("drops a server that needs authentication and never connected", () => {
	const statuses = [{ name: "Drata", health: "needs-authentication" as const }];

	assert.deepEqual(withoutUnusedServers(statuses, new Set(["Slack"])), []);
});

test("keeps a server that failed even if it never connected", () => {
	const statuses = [{ name: "broken", health: "failed" as const }];

	assert.deepEqual(withoutUnusedServers(statuses, new Set()), statuses);
});

test("keeps a server awaiting approval even if it never connected", () => {
	const statuses = [{ name: "team", health: "pending-approval" as const }];

	assert.deepEqual(withoutUnusedServers(statuses, new Set()), statuses);
});

test("keeps connected servers", () => {
	const statuses = [{ name: "Slack", health: "connected" as const }];

	assert.deepEqual(withoutUnusedServers(statuses, new Set()), statuses);
});
