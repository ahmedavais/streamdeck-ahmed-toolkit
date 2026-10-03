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
	private checkInFlight = false;

	constructor(
		private readonly timer: IntervalTimer,
		private readonly log: Log,
		private readonly options: PollingOptions,
	) {}

	async keyAppeared(): Promise<void> {
		this.startTimerUnlessRunning();
		await this.pollNow();
	}

	lastKeyGone(): void {
		this.polling = false;
		this.timer.stop();
	}

	async pollNow(): Promise<void> {
		if (this.checkInFlight) return;

		this.checkInFlight = true;
		try {
			const display = await this.options.check();
			if (display) this.options.show(display);
		} finally {
			this.checkInFlight = false;
		}
	}

	private startTimerUnlessRunning(): void {
		if (this.polling) return;

		this.polling = true;
		this.timer.start(this.options.everyMs, () => this.pollNow());
	}
}
