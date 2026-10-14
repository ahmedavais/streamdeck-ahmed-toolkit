import assert from "node:assert/strict";
import { test } from "node:test";
import { colorForUtilization, formatPercent, renderGaugeImage } from "./gauge-image";

const IRRELEVANT_NOW = 0;

test("colors utilization under 60% green", () => {
	assert.equal(colorForUtilization(0.59), "#3ddc84");
});

test("colors utilization between 60% and 85% yellow", () => {
	assert.equal(colorForUtilization(0.6), "#f5c542");
	assert.equal(colorForUtilization(0.84), "#f5c542");
});

test("colors utilization at or above 85% red", () => {
	assert.equal(colorForUtilization(0.85), "#e5484d");
	assert.equal(colorForUtilization(1), "#e5484d");
});

test("formats a fraction as a rounded whole-number percentage", () => {
	assert.equal(formatPercent(0.424), "42%");
	assert.equal(formatPercent(0.426), "43%");
});

test("a fresh reading renders the percentage in its utilization colour", () => {
	const svg = svgOf(renderGaugeImage({ usage: 0.9 }, "fresh", IRRELEVANT_NOW));

	assert.match(svg, /fill="#e5484d"[^>]*>90%</);
});

test("a stale reading renders the same percentage in grey", () => {
	const svg = svgOf(renderGaugeImage({ usage: 0.9 }, "stale", IRRELEVANT_NOW));

	assert.match(svg, /fill="#6b6b73"[^>]*>90%</);
});

test("shows how long until the weekly window resets under the percentage", () => {
	const resetsAt = 1_792_378_800_000;
	const fiveDaysOneHourBefore = resetsAt - (5 * 24 + 1) * 60 * 60 * 1000;

	const svg = svgOf(renderGaugeImage({ usage: 0.33, resetsAt }, "fresh", fiveDaysOneHourBefore));

	assert.match(svg, />↻ 5d 1h</);
});

test("leaves the reset line off when the reset time is unknown", () => {
	const svg = svgOf(renderGaugeImage({ usage: 0.25 }, "fresh", IRRELEVANT_NOW));

	assert.doesNotMatch(svg, /↻/);
});

test("leaves the reset line off once the reset time has passed", () => {
	const resetsAt = 1_792_378_800_000;

	const svg = svgOf(renderGaugeImage({ usage: 0.33, resetsAt }, "stale", resetsAt + 60_000));

	assert.doesNotMatch(svg, /↻/);
});

function svgOf(dataUri: string): string {
	return Buffer.from(dataUri.replace("data:image/svg+xml;base64,", ""), "base64").toString("utf8");
}
