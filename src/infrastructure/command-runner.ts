import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type CommandResult = { stdout: string; exitCode: number | null; timedOut: boolean };

type ProcessFailure = Error & { code?: number | string | null; killed?: boolean; stdout?: string };

const runProcess = promisify(execFile);

export class CommandRunner {
	static create(): CommandRunner {
		return new CommandRunner();
	}

	async run(command: string, args: string[], timeoutMs: number): Promise<CommandResult> {
		try {
			const { stdout } = await runProcess(command, args, { encoding: "utf8", timeout: timeoutMs });
			return { stdout, exitCode: 0, timedOut: false };
		} catch (failure) {
			const { code, killed = false, stdout = "" } = failure as ProcessFailure;
			if (typeof code === "string") throw new Error(`Could not run ${command}: ${(failure as Error).message}`, { cause: failure });
			return { stdout, exitCode: code as number | null, timedOut: killed };
		}
	}
}
