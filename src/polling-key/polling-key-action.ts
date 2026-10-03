import { SingletonAction, type WillAppearEvent, type WillDisappearEvent } from "@elgato/streamdeck";
import { Poller, type KeyDisplay, type PollingOptions } from "./poller";

export type PollingKeySettings = Omit<PollingOptions, "check" | "show">;

export abstract class PollingKeyAction extends SingletonAction {
	private readonly poller: Poller;

	protected constructor(settings: PollingKeySettings) {
		super();
		this.poller = Poller.create({ ...settings, check: () => this.check(), show: (display) => this.showOnVisibleKeys(display) });
	}

	protected abstract check(): Promise<KeyDisplay | undefined>;

	override onWillAppear(ev: WillAppearEvent): void {
		if (ev.action.isKey()) this.poller.keyAppeared();
	}

	override onWillDisappear(_ev: WillDisappearEvent): void {
		if (this.nothingVisible()) this.poller.lastKeyGone();
	}

	protected pollNow(): void {
		this.poller.pollNow();
	}

	private nothingVisible(): boolean {
		return this.actions.next().done === true;
	}

	private showOnVisibleKeys({ title, image }: KeyDisplay): void {
		for (const visibleAction of this.actions) {
			if (!visibleAction.isKey()) continue;

			if (title !== undefined) visibleAction.setTitle(title);
			visibleAction.setImage(image);
		}
	}
}
