import { CommandRunner, type CommandResult } from "../../infrastructure/command-runner";
import type { Session } from "../sessions/session";

const OPEN = "/usr/bin/open";
const SWITCH_TIMEOUT_MS = 5_000;

export class SessionSwitcher {
	static create(): SessionSwitcher {
		return new SessionSwitcher(CommandRunner.create());
	}

	constructor(private readonly runner: CommandRunner) {}

	async bringForward({ hostApp }: Session): Promise<void> {
		if (!hostApp) return;

		const result = await this.runner.run(OPEN, ["-b", hostApp], SWITCH_TIMEOUT_MS);
		if (result.exitCode !== 0) throw new Error(`Could not bring ${hostApp} to the front: ${openFailure(result)}`);
	}
}

function openFailure({ exitCode, timedOut }: CommandResult): string {
	if (timedOut) return `open timed out after ${SWITCH_TIMEOUT_MS / 1000}s`;
	return `open exited with code ${exitCode}`;
}
