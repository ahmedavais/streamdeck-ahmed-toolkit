export type RateLimitSnapshot = {
	usage: number;
	resetsAt?: number;
};

export function parseSnapshot(headers: Headers): RateLimitSnapshot | undefined {
	const sevenDay = headers.get("anthropic-ratelimit-unified-7d-utilization");
	if (sevenDay !== null) {
		return { usage: Number(sevenDay), ...weeklyResetIn(headers) };
	}

	const overage = headers.get("anthropic-ratelimit-unified-overage-utilization");
	if (overage !== null) {
		return { usage: Number(overage) };
	}

	return undefined;
}

function weeklyResetIn(headers: Headers): Pick<RateLimitSnapshot, "resetsAt"> {
	const resetSeconds = headers.get("anthropic-ratelimit-unified-7d-reset");
	return resetSeconds === null ? {} : { resetsAt: Number(resetSeconds) * 1000 };
}
