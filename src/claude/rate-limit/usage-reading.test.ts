import assert from "node:assert/strict";
import { test } from "node:test";
import { renderGaugeImage } from "./gauge-image";
import { RateLimitClient } from "./rate-limit-client";
import { UsageReading } from "./usage-reading";

const IRRELEVANT_NOW = 0;

test("shows a fresh reading in colour", async () => {
	const reading = new UsageReading(RateLimitClient.createNull({ usage: 0.42 }));

	const display = await reading.currentDisplay(IRRELEVANT_NOW);

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.42 }, "fresh", IRRELEVANT_NOW) });
});

test("shows nothing when the probe fails before any reading", async () => {
	const reading = new UsageReading(RateLimitClient.createNull({ unavailable: true }));

	const display = await reading.currentDisplay(IRRELEVANT_NOW);

	assert.equal(display, undefined);
});

test("shows the last reading greyed out when the probe fails", async () => {
	const reading = new UsageReading(RateLimitClient.createNull([{ usage: 0.42 }, { unavailable: true }]));
	await reading.currentDisplay(IRRELEVANT_NOW);

	const display = await reading.currentDisplay(IRRELEVANT_NOW);

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.42 }, "stale", IRRELEVANT_NOW) });
});

test("returns to colour when the probe recovers", async () => {
	const reading = new UsageReading(RateLimitClient.createNull([{ usage: 0.42 }, { unavailable: true }, { usage: 0.5 }]));
	await reading.currentDisplay(IRRELEVANT_NOW);
	await reading.currentDisplay(IRRELEVANT_NOW);

	const display = await reading.currentDisplay(IRRELEVANT_NOW);

	assert.deepEqual(display, { image: renderGaugeImage({ usage: 0.5 }, "fresh", IRRELEVANT_NOW) });
});
