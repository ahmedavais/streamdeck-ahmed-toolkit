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

test("stops the timer once the last key is gone", async () => {
	const { poller, timerEvents } = createPoller({ everyMs: 45_000 });
	await poller.keyAppeared();

	poller.lastKeyGone();

	assert.deepEqual(timerEvents.data, [{ started: { everyMs: 45_000 } }, { stopped: true }]);
});

test("starts again when a key reappears", async () => {
	const { poller, timerEvents } = createPoller({ everyMs: 45_000 });
	await poller.keyAppeared();
	poller.lastKeyGone();

	await poller.keyAppeared();

	assert.deepEqual(timerEvents.data, [{ started: { everyMs: 45_000 } }, { stopped: true }, { started: { everyMs: 45_000 } }]);
});

test("polls on demand", async () => {
	let checks = 0;
	const { poller, shown } = createPoller({ check: async () => ({ image: `check ${++checks}` }) });
	await poller.keyAppeared();

	await poller.pollNow();

	assert.deepEqual(shown, [{ image: "check 1" }, { image: "check 2" }]);
});

test("shows nothing when the check finds nothing", async () => {
	const { poller, shown } = createPoller({ check: async () => undefined });

	await poller.keyAppeared();

	assert.deepEqual(shown, []);
});

test("skips a poll while the previous one is still in flight", async () => {
	let checks = 0;
	let finishSlowCheck: (display: KeyDisplay) => void = () => {};
	const slowCheck = new Promise<KeyDisplay>((resolve) => (finishSlowCheck = resolve));
	const { poller, shown } = createPoller({
		check: () => {
			checks++;
			return slowCheck;
		},
	});
	const firstPoll = poller.pollNow();

	const overlappingPoll = poller.pollNow();
	finishSlowCheck({ image: "slow answer" });
	await Promise.all([firstPoll, overlappingPoll]);

	assert.equal(checks, 1);
	assert.deepEqual(shown, [{ image: "slow answer" }]);
});

test("logs a failed check and shows the failure display", async () => {
	const { poller, shown, logOutput } = createPoller({
		name: "MCP status",
		check: async () => {
			throw new Error("claude CLI not found");
		},
		failedDisplay: { title: "?", image: "grey" },
	});

	await poller.keyAppeared();

	assert.deepEqual(logOutput.data, [{ level: "error", message: "Could not refresh MCP status: claude CLI not found" }]);
	assert.deepEqual(shown, [{ title: "?", image: "grey" }]);
});

function createPoller({
	check = async (): Promise<KeyDisplay | undefined> => IRRELEVANT_DISPLAY,
	everyMs = IRRELEVANT_INTERVAL_MS,
	name = "irrelevant key",
	failedDisplay = undefined as KeyDisplay | undefined,
} = {}) {
	const timer = IntervalTimer.createNull();
	const timerEvents = timer.trackEvents();
	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const shown: KeyDisplay[] = [];
	const poller = new Poller(timer, log, { name, everyMs, check, failedDisplay, show: (display) => shown.push(display) });

	return { poller, timer, timerEvents, logOutput, shown };
}
