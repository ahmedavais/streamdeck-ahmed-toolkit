import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCountdown } from "./countdown";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test("shows days and hours when a day or more remains", () => {
	assert.equal(formatCountdown(5 * DAY + HOUR + 30 * MINUTE), "5d 1h");
});

test("shows hours and minutes when under a day", () => {
	assert.equal(formatCountdown(4 * HOUR + 12 * MINUTE + 59_000), "4h 12m");
});

test("shows minutes when under an hour", () => {
	assert.equal(formatCountdown(12 * MINUTE + 30_000), "12m");
});

test("a reset that has already passed reads zero minutes", () => {
	assert.equal(formatCountdown(-5 * MINUTE), "0m");
});
