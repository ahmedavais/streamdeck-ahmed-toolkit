import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type CommandResult = { stdout: string; exitCode: number | null; timedOut: boolean };

const runProcess = promisify(execFile);

export class CommandRunner {
	static create(): CommandRunner {
		return new CommandRunner();
	}

	async run(command: string, args: string[], timeoutMs: number): Promise<CommandResult> {
		const { stdout } = await runProcess(command, args, { encoding: "utf8", timeout: timeoutMs });
		return { stdout, exitCode: 0, timedOut: false };
	}
}
