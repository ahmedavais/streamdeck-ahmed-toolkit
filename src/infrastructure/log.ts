import streamDeck from "@elgato/streamdeck";
import { OutputListener, type OutputTracker } from "./output-listener";

export type LogEntry = { level: "info" | "error"; message: string };

type Logger = { info(message: string): void; error(message: string): void };

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

	info(message: string): void {
		this.write("info", message);
	}

	error(message: string): void {
		this.write("error", message);
	}

	private write(level: LogEntry["level"], message: string): void {
		this.output.emit({ level, message });
		this.logger[level](message);
	}
}

const stubbedLogger: Logger = { info: () => {}, error: () => {} };
