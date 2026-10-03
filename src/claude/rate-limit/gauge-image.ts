import type { RateLimitSnapshot } from "./parse-snapshot";

const GREEN = "#3ddc84";
const YELLOW = "#f5c542";
const RED = "#e5484d";
const STALE_GREY = "#6b6b73";

export function colorForUtilization(fraction: number): string {
	if (fraction < 0.6) return GREEN;
	if (fraction < 0.85) return YELLOW;
	return RED;
}

export function formatPercent(fraction: number): string {
	return `${Math.round(fraction * 100)}%`;
}

export type Freshness = "fresh" | "stale";

export function renderGaugeImage(snapshot: RateLimitSnapshot, freshness: Freshness): string {
	const color = freshness === "stale" ? STALE_GREY : colorForUtilization(snapshot.usage);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
		<rect width="144" height="144" fill="#1e1e23"/>
		<text x="72" y="80" font-family="Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="${color}" text-anchor="middle">${formatPercent(snapshot.usage)}</text>
	</svg>`;

	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
