export class OutputListener<T> {
	private readonly trackers: OutputTracker<T>[] = [];

	emit(output: T): void {
		for (const tracker of this.trackers) tracker.data.push(output);
	}

	trackOutput(): OutputTracker<T> {
		const tracker = new OutputTracker<T>();
		this.trackers.push(tracker);
		return tracker;
	}
}

export class OutputTracker<T> {
	readonly data: T[] = [];
}
