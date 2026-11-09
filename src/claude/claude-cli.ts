import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { toolDirectories } from "./tool-directories";

const BARE_COMMAND = "claude";

export function pickClaudeCli(candidates: string[], exists: (path: string) => boolean): string {
	return candidates.find(exists) ?? BARE_COMMAND;
}

export function claudeCli(): string {
	return pickClaudeCli(
		toolDirectories(os.homedir()).map((directory) => path.join(directory, BARE_COMMAND)),
		fs.existsSync,
	);
}
