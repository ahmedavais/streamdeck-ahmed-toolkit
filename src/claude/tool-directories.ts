import path from "node:path";

export function toolDirectories(home: string): string[] {
	return [path.join(home, ".local", "bin"), path.join("/opt", "homebrew", "bin"), path.join("/usr", "local", "bin")];
}
