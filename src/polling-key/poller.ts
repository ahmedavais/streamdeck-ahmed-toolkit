import type { IntervalTimer } from "../infrastructure/interval-timer";
import type { Log } from "../infrastructure/log";

export type KeyDisplay = { title?: string; image: string };

export type PollingOptions = {
	everyMs: number;
	check: () => Promise<KeyDisplay | undefined>;
	show: (display: KeyDisplay) => void;
};

export class Poller {
	private polling = false;

	constructor(
		private readonly timer: IntervalTimer,
		private readonly log: Log,
		private readonly options: PollingOptions,
	) {}

	async keyAppeared(): Promise<void> {
		if (!this.polling) {
			this.polling = true;
			this.timer.start(this.options.everyMs, () => this.poll());
		}
		await this.poll();
	}

	private async poll(): Promise<void> {
		this.options.show((await this.options.check()) as KeyDisplay);
	}
}
