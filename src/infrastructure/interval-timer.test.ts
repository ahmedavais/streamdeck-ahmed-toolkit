import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { test } from "node:test";
import { IntervalTimer } from "./interval-timer";

test("calls back on every interval until stopped", async () => {
	const timer = IntervalTimer.create();
	let ticks = 0;

	timer.start(5, () => ticks++);
	await wait(30);
	timer.stop();
	const ticksWhenStopped = ticks;
	await wait(20);

	assert.ok(ticksWhenStopped >= 2, `expected several ticks, got ${ticksWhenStopped}`);
	assert.equal(ticks, ticksWhenStopped, "shouldn't tick after stopping");
});

test("a nulled timer never fires on its own", async () => {
	const timer = IntervalTimer.createNull();
	let ticks = 0;

	timer.start(1, () => ticks++);
	await wait(20);
	timer.stop();

	assert.equal(ticks, 0);
});

test("a nulled timer fires when a tick is simulated", async () => {
	const timer = IntervalTimer.createNull();
	let ticks = 0;
	timer.start(60_000, () => ticks++);

	await timer.simulateTick();
	await timer.simulateTick();

	assert.equal(ticks, 2);
});
