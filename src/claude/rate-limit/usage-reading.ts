import type { KeyDisplay } from "../../polling-key/poller";
import { renderGaugeImage } from "./gauge-image";
import type { RateLimitClient } from "./rate-limit-client";

export class UsageReading {
	constructor(private readonly rateLimit: RateLimitClient) {}

	async currentDisplay(): Promise<KeyDisplay | undefined> {
		const snapshot = await this.rateLimit.fetchSnapshot();
		return snapshot ? { image: renderGaugeImage(snapshot, "fresh") } : undefined;
	}
}
