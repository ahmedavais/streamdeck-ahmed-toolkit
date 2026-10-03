import { OutputListener, type OutputTracker } from "./output-listener";

export type TimerEvent = { started: { everyMs: number } } | { stopped: true };

type Timers = {
	setInterval(onTick: () => unknown, everyMs: number): NodeJS.Timeout;
	clearInterval(running: NodeJS.Timeout | undefined): void;
};

export class IntervalTimer {
	static create(): IntervalTimer {
		return new IntervalTimer({ setInterval, clearInterval });
	}

	static createNull(): IntervalTimer {
		return new IntervalTimer(new StubbedTimers());
	}

	private running: NodeJS.Timeout | undefined;
	private onTick: () => unknown = doNothing;

	private readonly events = new OutputListener<TimerEvent>();

	constructor(private readonly timers: Timers) {}

	trackEvents(): OutputTracker<TimerEvent> {
		return this.events.trackOutput();
	}

	start(everyMs: number, onTick: () => unknown): void {
		this.events.emit({ started: { everyMs } });
		this.onTick = onTick;
		this.running = this.timers.setInterval(() => this.onTick(), everyMs);
	}

	async simulateTick(): Promise<void> {
		await this.onTick();
	}

	stop(): void {
		this.events.emit({ stopped: true });
		this.timers.clearInterval(this.running);
		this.onTick = doNothing;
	}
}

function doNothing(): void {}

class StubbedTimers implements Timers {
	setInterval(): NodeJS.Timeout {
		return {} as NodeJS.Timeout;
	}

	clearInterval(): void {}
}
