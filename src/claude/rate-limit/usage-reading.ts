import type { KeyDisplay } from "../../polling-key/poller";
import { renderGaugeImage } from "./gauge-image";
import type { RateLimitSnapshot } from "./parse-snapshot";
import { RateLimitClient } from "./rate-limit-client";

export class UsageReading {
	static create(): UsageReading {
		return new UsageReading(RateLimitClient.create());
	}

	private lastSnapshot: RateLimitSnapshot | undefined;

	constructor(private readonly rateLimit: RateLimitClient) {}

	async currentDisplay(): Promise<KeyDisplay | undefined> {
		const snapshot = await this.rateLimit.fetchSnapshot();
		this.lastSnapshot = snapshot ?? this.lastSnapshot;
		if (!this.lastSnapshot) return undefined;

		return { image: renderGaugeImage(this.lastSnapshot, snapshot ? "fresh" : "stale") };
	}
}
