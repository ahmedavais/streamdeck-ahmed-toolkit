import { action } from "@elgato/streamdeck";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { UsageReading } from "../rate-limit/usage-reading";

const POLL_INTERVAL_MS = 60 * 1000;

@action({ UUID: "com.ahmedavais.toolkit.claude.usage-gauge" })
export class UsageGauge extends PollingKeyAction {
	private readonly usage = UsageReading.create();

	constructor() {
		super({ name: "usage gauge", everyMs: POLL_INTERVAL_MS });
	}

	protected override check(): Promise<KeyDisplay | undefined> {
		return this.usage.currentDisplay();
	}
}
