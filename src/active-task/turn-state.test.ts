import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseTurnToDisplay, elapsedOf, isInProgress } from "./turn-state";

test("nothing to display when no session has taken a turn", () => {
	assert.equal(chooseTurnToDisplay({}), undefined);
});

test("displays the turn of the only session", () => {
	assert.deepEqual(chooseTurnToDisplay({ "session-a": { turnStartedAt: 100 } }), {
		sessionId: "session-a",
		turn: { turnStartedAt: 100 },
	});
});

test("prefers a turn in progress over a finished one", () => {
	const turns = {
		"session-finished": { turnStartedAt: 100, turnEndedAt: 900 },
		"session-working": { turnStartedAt: 500 },
	};

	assert.equal(chooseTurnToDisplay(turns)?.sessionId, "session-working");
});

test("displays the longest running turn when several are in progress", () => {
	const turns = {
		"session-recent": { turnStartedAt: 300 },
		"session-longest": { turnStartedAt: 100 },
		"session-middle": { turnStartedAt: 200 },
	};

	assert.equal(chooseTurnToDisplay(turns)?.sessionId, "session-longest");
});

test("displays the most recently finished turn when none are in progress", () => {
	const turns = {
		"session-stale": { turnStartedAt: 100, turnEndedAt: 200 },
		"session-latest": { turnStartedAt: 300, turnEndedAt: 800 },
	};

	assert.equal(chooseTurnToDisplay(turns)?.sessionId, "session-latest");
});

test("a turn in progress has elapsed time that grows with the clock", () => {
	assert.equal(elapsedOf({ turnStartedAt: 1_000 }, 4_000), 3_000);
});

test("a finished turn keeps the elapsed time it had when it ended", () => {
	assert.equal(elapsedOf({ turnStartedAt: 1_000, turnEndedAt: 2_500 }, 99_000), 1_500);
});

test("a turn is in progress until it has ended", () => {
	assert.equal(isInProgress({ turnStartedAt: 1_000 }), true);
	assert.equal(isInProgress({ turnStartedAt: 1_000, turnEndedAt: 2_000 }), false);
});
