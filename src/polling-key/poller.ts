import { IntervalTimer } from "../infrastructure/interval-timer";
import { Log } from "../infrastructure/log";

export type KeyDisplay = { title?: string; image: string };

export type PollingOptions = {
	name: string;
	everyMs: number;
	check: () => Promise<KeyDisplay | undefined>;
	show: (display: KeyDisplay) => void;
	failedDisplay?: KeyDisplay;
};

export class Poller {
	static create(options: PollingOptions): Poller {
		return new Poller(IntervalTimer.create(), Log.create(), options);
	}

	private timerRunning = false;
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
		this.timerRunning = false;
		this.timer.stop();
	}

	async pollNow(): Promise<void> {
		if (this.checkInFlight) return;

		this.checkInFlight = true;
		try {
			await this.showWhatCheckFinds();
		} catch (failure) {
			this.reportFailed(failure as Error);
		} finally {
			this.checkInFlight = false;
		}
	}

	private async showWhatCheckFinds(): Promise<void> {
		const display = await this.options.check();
		if (display) this.options.show(display);
	}

	private reportFailed(failure: Error): void {
		this.log.error(`Could not refresh ${this.options.name}: ${failure.message}`);
		if (this.options.failedDisplay) this.options.show(this.options.failedDisplay);
	}

	private startTimerUnlessRunning(): void {
		if (this.timerRunning) return;

		this.timerRunning = true;
		this.timer.start(this.options.everyMs, () => this.pollNow());
	}
}
