import fs from "node:fs";
import os from "node:os";
import { CommandRunner, type CommandResult } from "../../infrastructure/command-runner";
import { claudeCli } from "../claude-cli";

const PSEUDO_TERMINAL = "/usr/bin/script";
const START_TIMEOUT_MS = 30_000;
const ESCAPE_SEQUENCE = /\x1b\[[0-9;?]*[A-Za-z]/g;
const CONTROL_CHARACTER = /[\x00-\x1f\x7f]/g;

export class SessionStarter {
	static create(): SessionStarter {
		return new SessionStarter(CommandRunner.create(), claudeCli, os.homedir(), fs.existsSync);
	}

	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
		private readonly home: string,
		private readonly folderExists: (folder: string) => boolean,
	) {}

	async start(projectFolder: string | undefined): Promise<void> {
		if (!projectFolder) throw new Error("No project folder set for this key");

		const folder = this.expandHome(projectFolder);
		if (!this.folderExists(folder)) throw new Error(`Project folder ${folder} doesn't exist`);

		const result = await this.runner.run(PSEUDO_TERMINAL, ["-q", "/dev/null", this.locateCli(), "--desktop"], START_TIMEOUT_MS, { cwd: folder });
		if (result.exitCode !== 0) throw new Error(`Could not open ${folder} in Claude Desktop: ${cliFailure(result)}`);
	}

	private expandHome(folder: string): string {
		return folder.replace(/^~(?=\/|$)/, this.home);
	}
}

function cliFailure({ exitCode, stdout, timedOut }: CommandResult): string {
	if (timedOut) return `claude timed out after ${START_TIMEOUT_MS / 1000}s`;

	const printed = readableTextOf(stdout);
	return `claude exited with code ${exitCode}${printed ? `: ${printed}` : ""}`;
}

function readableTextOf(terminalOutput: string): string {
	return terminalOutput.replace(ESCAPE_SEQUENCE, "").replace(CONTROL_CHARACTER, " ").replace(/\s+/g, " ").trim();
}
