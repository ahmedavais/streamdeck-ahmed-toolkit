import assert from "node:assert/strict";
import { test } from "node:test";
import { mostUrgentWaiting } from "./waiting-state";

test("nothing needs attention when no session is waiting", () => {
	assert.equal(mostUrgentWaiting({ "session-a": { turnStartedAt: 1_000 } }), undefined);
});

test("the only waiting session needs attention", () => {
	const sessions = {
		"session-working": { turnStartedAt: 1_000 },
		"session-waiting": { turnStartedAt: 1_000, waiting: { for: "input" as const, since: 3_000 } },
	};

	assert.deepEqual(mostUrgentWaiting(sessions), { for: "input", since: 3_000 });
});
