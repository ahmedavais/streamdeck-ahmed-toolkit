import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type CommandResult = { stdout: string; exitCode: number | null; timedOut: boolean };

type ProcessFailure = Error & { code?: number | string | null; killed?: boolean; stdout?: string };

type RunProcess = (command: string, args: string[], options: { encoding: "utf8"; timeout: number }) => Promise<{ stdout: string }>;

export class CommandRunner {
	static create(): CommandRunner {
		return new CommandRunner(promisify(execFile));
	}

	static createNull(): CommandRunner {
		return new CommandRunner(stubbedRunProcess);
	}

	constructor(private readonly runProcess: RunProcess) {}

	async run(command: string, args: string[], timeoutMs: number): Promise<CommandResult> {
		try {
			const { stdout } = await this.runProcess(command, args, { encoding: "utf8", timeout: timeoutMs });
			return { stdout, exitCode: 0, timedOut: false };
		} catch (failure) {
			const { code, killed = false, stdout = "" } = failure as ProcessFailure;
			if (typeof code === "string") throw new Error(`Could not run ${command}: ${(failure as Error).message}`, { cause: failure });
			return { stdout, exitCode: code as number | null, timedOut: killed };
		}
	}
}

async function stubbedRunProcess(): Promise<{ stdout: string }> {
	return { stdout: "" };
}
