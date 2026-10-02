import assert from "node:assert/strict";
import { test } from "node:test";
import { formatElapsed } from "./elapsed";

test("formats sub-minute elapsed time as mm:ss", () => {
	assert.equal(formatElapsed(5_000), "00:05");
});

test("formats minutes and seconds as mm:ss", () => {
	assert.equal(formatElapsed(90_000), "01:30");
});

test("switches to h:mm:ss once an hour has passed", () => {
	assert.equal(formatElapsed(3_661_000), "1:01:01");
});

test("clamps negative elapsed time to zero", () => {
	assert.equal(formatElapsed(-500), "00:00");
});
