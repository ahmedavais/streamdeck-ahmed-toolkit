import assert from "node:assert/strict";
import { test } from "node:test";
import { renderGaugeImage } from "./gauge-image";
import { RateLimitClient } from "./rate-limit-client";
import { UsageReading } from "./usage-reading";

test("shows a fresh reading in colour", async () => {
	const reading = new UsageReading(RateLimitClient.createNull({ usage: 0.42 }));

	const display = await reading.currentDisplay();

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.42 }, "fresh") });
});

test("shows nothing when the probe fails before any reading", async () => {
	const reading = new UsageReading(RateLimitClient.createNull({ unavailable: true }));

	const display = await reading.currentDisplay();

	assert.equal(display, undefined);
});

test("shows the last reading greyed out when the probe fails", async () => {
	const reading = new UsageReading(RateLimitClient.createNull([{ usage: 0.42 }, { unavailable: true }]));
	await reading.currentDisplay();

	const display = await reading.currentDisplay();

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.42 }, "stale") });
});

test("returns to colour when the probe recovers", async () => {
	const reading = new UsageReading(RateLimitClient.createNull([{ usage: 0.42 }, { unavailable: true }, { usage: 0.5 }]));
	await reading.currentDisplay();
	await reading.currentDisplay();

	const display = await reading.currentDisplay();

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.5 }, "fresh") });
});
