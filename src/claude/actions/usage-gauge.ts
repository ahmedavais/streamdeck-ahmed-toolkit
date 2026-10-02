import { action, KeyAction, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { renderGaugeImage } from "../rate-limit/gauge-image";
import { RateLimitClient } from "../rate-limit/rate-limit-client";

const POLL_INTERVAL_MS = 60 * 1000;

@action({ UUID: "com.ahmedavais.toolkit.claude.usage-gauge" })
export class UsageGauge extends SingletonAction {
	private readonly rateLimit = RateLimitClient.create();
	private timer: NodeJS.Timeout | undefined;

	override onWillAppear(ev: WillAppearEvent): void {
		if (!ev.action.isKey()) return;

		this.refresh(ev.action);

		if (!this.timer) {
			this.timer = setInterval(() => {
				for (const visibleAction of this.actions) {
					if (visibleAction.isKey()) this.refresh(visibleAction);
				}
			}, POLL_INTERVAL_MS);
		}
	}

	override onWillDisappear(_ev: WillDisappearEvent): void {
		if (this.actions.next().done) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	private async refresh(action: KeyAction): Promise<void> {
		const snapshot = await this.rateLimit.fetchSnapshot();
		if (!snapshot) return;

		action.setImage(renderGaugeImage(snapshot));
	}
}
