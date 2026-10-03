import type { KeyDisplay } from "../../polling-key/poller";
import { renderGaugeImage } from "./gauge-image";
import type { RateLimitSnapshot } from "./parse-snapshot";
import type { RateLimitClient } from "./rate-limit-client";

export class UsageReading {
	private lastSnapshot: RateLimitSnapshot | undefined;

	constructor(private readonly rateLimit: RateLimitClient) {}

	async currentDisplay(): Promise<KeyDisplay | undefined> {
		const snapshot = await this.rateLimit.fetchSnapshot();
		if (snapshot) {
			this.lastSnapshot = snapshot;
			return { image: renderGaugeImage(snapshot, "fresh") };
		}

		return this.lastSnapshot ? { image: renderGaugeImage(this.lastSnapshot, "stale") } : undefined;
	}
}
