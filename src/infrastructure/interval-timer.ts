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

	constructor(private readonly timers: Timers) {}

	start(everyMs: number, onTick: () => unknown): void {
		this.running = this.timers.setInterval(onTick, everyMs);
	}

	stop(): void {
		this.timers.clearInterval(this.running);
	}
}

class StubbedTimers implements Timers {
	setInterval(): NodeJS.Timeout {
		return {} as NodeJS.Timeout;
	}

	clearInterval(): void {}
}
