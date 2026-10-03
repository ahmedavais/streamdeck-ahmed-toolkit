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
