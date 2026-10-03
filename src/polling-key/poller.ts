import type { IntervalTimer } from "../infrastructure/interval-timer";
import type { Log } from "../infrastructure/log";

export type KeyDisplay = { title?: string; image: string };

export type PollingOptions = {
	everyMs: number;
	check: () => Promise<KeyDisplay | undefined>;
	show: (display: KeyDisplay) => void;
};

export class Poller {
	constructor(
		private readonly timer: IntervalTimer,
		private readonly log: Log,
		private readonly options: PollingOptions,
	) {}

	async keyAppeared(): Promise<void> {
		this.options.show((await this.options.check()) as KeyDisplay);
	}
}
