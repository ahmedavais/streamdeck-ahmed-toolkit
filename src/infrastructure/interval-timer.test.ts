import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { test } from "node:test";
import { IntervalTimer } from "./interval-timer";

test("calls back on every interval until stopped", async () => {
	const timer = IntervalTimer.create();
	let ticks = 0;

	timer.start(5, () => ticks++);
	await waitUntil(() => ticks >= 2);
	timer.stop();
	const ticksWhenStopped = ticks;
	await wait(20);

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

test("a stopped timer ignores simulated ticks", async () => {
	const timer = IntervalTimer.createNull();
	let ticks = 0;
	timer.start(60_000, () => ticks++);

	timer.stop();
	await timer.simulateTick();

	assert.equal(ticks, 0);
});

test("tracks when it starts and stops", () => {
	const timer = IntervalTimer.createNull();
	const events = timer.trackEvents();

	timer.start(45_000, () => {});
	timer.stop();

	assert.deepEqual(events.data, [{ started: { everyMs: 45_000 } }, { stopped: true }]);
});

async function waitUntil(condition: () => boolean, timeoutMs = 2_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (!condition()) {
		if (Date.now() > deadline) throw new Error(`Condition not met within ${timeoutMs}ms`);
		await wait(1);
	}
}
