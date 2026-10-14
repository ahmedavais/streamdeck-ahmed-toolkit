const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatCountdown(remainingMs: number): string {
	const remaining = Math.max(0, remainingMs);
	const days = Math.floor(remaining / DAY_MS);
	const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
	const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);

	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}
