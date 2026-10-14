import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BARE_COMMAND = "claude";

export function pickClaudeCli(candidates: string[], exists: (path: string) => boolean): string {
	return candidates.find(exists) ?? BARE_COMMAND;
}

export function claudeCli(): string {
	return pickClaudeCli(
		[
			path.join(os.homedir(), ".local", "bin", BARE_COMMAND),
			path.join("/opt", "homebrew", "bin", BARE_COMMAND),
			path.join("/usr", "local", "bin", BARE_COMMAND),
		],
		fs.existsSync,
	);
}
