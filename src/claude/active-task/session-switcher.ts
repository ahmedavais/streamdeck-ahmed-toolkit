import { CommandRunner } from "../../infrastructure/command-runner";
import type { Session } from "../sessions/session";

const OPEN = "/usr/bin/open";
const SWITCH_TIMEOUT_MS = 5_000;

export class SessionSwitcher {
	constructor(private readonly runner: CommandRunner) {}

	async bringForward(session: Session): Promise<void> {
		await this.runner.run(OPEN, ["-b", session.hostApp!], SWITCH_TIMEOUT_MS);
	}
}
