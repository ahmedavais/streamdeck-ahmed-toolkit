export class IntervalTimer {
	static create(): IntervalTimer {
		return new IntervalTimer();
	}

	private running: NodeJS.Timeout | undefined;

	start(everyMs: number, onTick: () => unknown): void {
		this.running = setInterval(onTick, everyMs);
	}

	stop(): void {
		clearInterval(this.running);
		this.running = undefined;
	}
}
