import fs from "node:fs";
import path from "node:path";

type RegistryEntry = { pid: number; sessionId: string };

export function liveSessionIds(registryDir: string, isRunning: (pid: number) => boolean): Set<string> | undefined {
	const entries = fs
		.readdirSync(registryDir)
		.filter((name) => name.endsWith(".json"))
		.map((name) => JSON.parse(fs.readFileSync(path.join(registryDir, name), "utf8")) as RegistryEntry);

	return new Set(entries.map(({ sessionId }) => sessionId));
}
