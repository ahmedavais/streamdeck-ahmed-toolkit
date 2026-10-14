import assert from "node:assert/strict";
import { test } from "node:test";
import { mostUrgentWaiting } from "./waiting-state";

test("nothing needs attention when no session is waiting", () => {
	assert.equal(mostUrgentWaiting({ "session-a": { turnStartedAt: 1_000 } }), undefined);
});
