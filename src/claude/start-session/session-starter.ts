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
		await this.runner.run(PSEUDO_TERMINAL, ["-q", "/dev/null", this.locateCli(), "--desktop"], START_TIMEOUT_MS, { cwd: this.expandHome(projectFolder!) });
	}

	private expandHome(folder: string): string {
		return folder.replace(/^~(?=\/|$)/, this.home);
	}
}
