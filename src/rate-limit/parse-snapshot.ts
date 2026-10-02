export type RateLimitSnapshot = {
	usage: number;
};

// anthropic-ratelimit-unified-* is an undocumented header family and can change without notice;
// when the 7d field is missing (e.g. account is drawing on overage) we fall back to the
// overage utilization instead of failing outright.
export function parseSnapshot(headers: Headers): RateLimitSnapshot | undefined {
	const sevenDay = headers.get("anthropic-ratelimit-unified-7d-utilization");
	if (sevenDay !== null) {
		return { usage: Number(sevenDay) };
	}

	const overage = headers.get("anthropic-ratelimit-unified-overage-utilization");
	if (overage !== null) {
		return { usage: Number(overage) };
	}

	return undefined;
}
