import { action } from "@elgato/streamdeck";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { renderGaugeImage } from "../rate-limit/gauge-image";
import { RateLimitClient } from "../rate-limit/rate-limit-client";

const POLL_INTERVAL_MS = 60 * 1000;

@action({ UUID: "com.ahmedavais.toolkit.claude.usage-gauge" })
export class UsageGauge extends PollingKeyAction {
	private readonly rateLimit = RateLimitClient.create();

	constructor() {
		super({ name: "usage gauge", everyMs: POLL_INTERVAL_MS });
	}

	protected override async check(): Promise<KeyDisplay | undefined> {
		const snapshot = await this.rateLimit.fetchSnapshot();
		return snapshot ? { image: renderGaugeImage(snapshot) } : undefined;
	}
}
