import assert from "node:assert/strict";
import { test } from "node:test";
import { IntervalTimer } from "../infrastructure/interval-timer";
import { Log } from "../infrastructure/log";
import { Poller, type KeyDisplay } from "./poller";

const IRRELEVANT_INTERVAL_MS = 1_000;
const IRRELEVANT_DISPLAY: KeyDisplay = { title: "irrelevant", image: "irrelevant image" };

test("shows what the check finds as soon as a key appears", async () => {
	const { poller, shown } = createPoller({ check: async () => ({ title: "3", image: "green" }) });

	await poller.keyAppeared();

	assert.deepEqual(shown, [{ title: "3", image: "green" }]);
});

test("starts the timer at the given interval when the first key appears", async () => {
	const { poller, timerEvents } = createPoller({ everyMs: 45_000 });

	await poller.keyAppeared();

	assert.deepEqual(timerEvents.data, [{ started: { everyMs: 45_000 } }]);
});

test("keeps a single timer when more keys appear", async () => {
	const { poller, timerEvents } = createPoller({ everyMs: 45_000 });

	await poller.keyAppeared();
	await poller.keyAppeared();

	assert.deepEqual(timerEvents.data, [{ started: { everyMs: 45_000 } }]);
});

test("shows what the check finds on every tick", async () => {
	let checks = 0;
	const { poller, timer, shown } = createPoller({ check: async () => ({ image: `check ${++checks}` }) });
	await poller.keyAppeared();

	await timer.simulateTick();
	await timer.simulateTick();

	assert.deepEqual(shown, [{ image: "check 1" }, { image: "check 2" }, { image: "check 3" }]);
});

function createPoller({
	check = async (): Promise<KeyDisplay | undefined> => IRRELEVANT_DISPLAY,
	everyMs = IRRELEVANT_INTERVAL_MS,
} = {}) {
	const timer = IntervalTimer.createNull();
	const timerEvents = timer.trackEvents();
	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const shown: KeyDisplay[] = [];
	const poller = new Poller(timer, log, { everyMs, check, show: (display) => shown.push(display) });

	return { poller, timer, timerEvents, logOutput, shown };
}
