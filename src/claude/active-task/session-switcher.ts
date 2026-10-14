import { CommandRunner } from "../../infrastructure/command-runner";
import type { Session } from "../sessions/session";

const OPEN = "/usr/bin/open";
const SWITCH_TIMEOUT_MS = 5_000;

export class SessionSwitcher {
	constructor(private readonly runner: CommandRunner) {}

	async bringForward({ hostApp }: Session): Promise<void> {
		if (!hostApp) return;

		await this.runner.run(OPEN, ["-b", hostApp], SWITCH_TIMEOUT_MS);
	}
}
