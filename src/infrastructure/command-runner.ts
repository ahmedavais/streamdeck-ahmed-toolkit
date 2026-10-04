import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ConfigurableResponses } from "./configurable-responses";

export type CommandResult = { stdout: string; exitCode: number | null; timedOut: boolean };

export type NulledCommandResult = CommandResult | { cannotStart: true };

type ProcessFailure = Error & { code?: number | string | null; killed?: boolean; stdout?: string };

type RunProcess = (command: string, args: string[], options: { encoding: "utf8"; timeout: number }) => Promise<{ stdout: string }>;

export class CommandRunner {
	static create(): CommandRunner {
		return new CommandRunner(promisify(execFile));
	}

	static createNull(results: NulledCommandResult | NulledCommandResult[] = DEFAULT_NULLED_RESULT): CommandRunner {
		return new CommandRunner(stubbedRunProcess(ConfigurableResponses.create(results, "nulled CommandRunner")));
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

const DEFAULT_NULLED_RESULT: CommandResult = { stdout: "Nulled CommandRunner default output", exitCode: 0, timedOut: false };

function stubbedRunProcess(results: ConfigurableResponses<NulledCommandResult>): RunProcess {
	return async (command) => {
		const result = results.next();
		if ("cannotStart" in result) throw Object.assign(new Error(`spawn ${command} ENOENT`), { code: "ENOENT" });

		const { stdout, exitCode, timedOut } = result;
		if (exitCode === 0) return { stdout };
		throw Object.assign(new Error("Command failed"), { code: exitCode, killed: timedOut, stdout });
	};
}
