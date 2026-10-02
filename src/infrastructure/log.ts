import streamDeck from "@elgato/streamdeck";
import { OutputListener, type OutputTracker } from "./output-listener";

export type LogEntry = { level: "error"; message: string };

type Logger = { error(message: string): void };

export class Log {
	static create(): Log {
		return new Log(streamDeck.logger);
	}

	static createNull(): Log {
		return new Log(stubbedLogger);
	}

	private readonly output = new OutputListener<LogEntry>();

	constructor(private readonly logger: Logger) {}

	trackOutput(): OutputTracker<LogEntry> {
		return this.output.trackOutput();
	}

	error(message: string): void {
		this.output.emit({ level: "error", message });
		this.logger.error(message);
	}
}

const stubbedLogger: Logger = { error: () => {} };
