import { CommandRunner, type CommandResult } from "../../infrastructure/command-runner";

const PSEUDO_TERMINAL = "/usr/bin/script";
const START_TIMEOUT_MS = 30_000;
const ESCAPE_SEQUENCE = /\x1b\[[0-9;?]*[A-Za-z]/g;
const CONTROL_CHARACTER = /[\x00-\x1f\x7f]/g;

export class SessionStarter {
	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
		private readonly home: string,
	) {}

	async start(projectFolder: string | undefined): Promise<void> {
		if (!projectFolder) throw new Error("No project folder set for this key");

		const folder = this.expandHome(projectFolder);
		const result = await this.runner.run(PSEUDO_TERMINAL, ["-q", "/dev/null", this.locateCli(), "--desktop"], START_TIMEOUT_MS, { cwd: folder });
		if (result.exitCode !== 0) throw new Error(`Could not open ${folder} in Claude Desktop: ${cliFailure(result)}`);
	}

	private expandHome(folder: string): string {
		return folder.replace(/^~(?=\/|$)/, this.home);
	}
}

function cliFailure({ exitCode, stdout }: CommandResult): string {
	const printed = readableTextOf(stdout);
	return `claude exited with code ${exitCode}${printed ? `: ${printed}` : ""}`;
}

function readableTextOf(terminalOutput: string): string {
	return terminalOutput.replace(ESCAPE_SEQUENCE, "").replace(CONTROL_CHARACTER, " ").replace(/\s+/g, " ").trim();
}
