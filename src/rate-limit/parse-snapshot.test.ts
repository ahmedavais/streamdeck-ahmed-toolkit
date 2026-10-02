import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSnapshot } from "./parse-snapshot";

test("reads weekly utilization when the 7d window is reported", () => {
	const headers = new Headers({
		"anthropic-ratelimit-unified-5h-utilization": "0.42",
		"anthropic-ratelimit-unified-7d-utilization": "0.17",
	});

	assert.deepEqual(parseSnapshot(headers), { usage: 0.17 });
});

test("falls back to overage utilization when the 7d window is absent", () => {
	const headers = new Headers({
		"anthropic-ratelimit-unified-overage-utilization": "0.25",
	});

	assert.deepEqual(parseSnapshot(headers), { usage: 0.25 });
});

test("reports nothing when none of the known fields are present", () => {
	const headers = new Headers();

	assert.equal(parseSnapshot(headers), undefined);
});
