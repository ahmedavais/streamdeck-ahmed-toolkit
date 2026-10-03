import assert from "node:assert/strict";
import { test } from "node:test";
import { colorForUtilization, formatPercent, renderGaugeImage } from "./gauge-image";

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

test("renders a data-uri image without throwing", () => {
	const image = renderGaugeImage({ usage: 0.17 }, "fresh");
	assert.match(image, /^data:image\/svg\+xml;base64,/);
});

test("a stale reading renders the same percentage in grey", () => {
	const svg = svgOf(renderGaugeImage({ usage: 0.9 }, "stale"));

	assert.match(svg, /fill="#6b6b73"[^>]*>90%</);
});

function svgOf(dataUri: string): string {
	return Buffer.from(dataUri.replace("data:image/svg+xml;base64,", ""), "base64").toString("utf8");
}
