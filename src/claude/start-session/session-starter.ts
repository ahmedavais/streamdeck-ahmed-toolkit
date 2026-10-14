import { CommandRunner } from "../../infrastructure/command-runner";

const PSEUDO_TERMINAL = "/usr/bin/script";
const START_TIMEOUT_MS = 30_000;

export class SessionStarter {
	constructor(
		private readonly runner: CommandRunner,
		private readonly locateCli: () => string,
		private readonly home: string,
	) {}

	async start(projectFolder: string | undefined): Promise<void> {
		if (!projectFolder) throw new Error("No project folder set for this key");

		const folder = this.expandHome(projectFolder);
		const { exitCode } = await this.runner.run(PSEUDO_TERMINAL, ["-q", "/dev/null", this.locateCli(), "--desktop"], START_TIMEOUT_MS, { cwd: folder });
		if (exitCode !== 0) throw new Error(`Could not open ${folder} in Claude Desktop: claude exited with code ${exitCode}`);
	}

	private expandHome(folder: string): string {
		return folder.replace(/^~(?=\/|$)/, this.home);
	}
}
