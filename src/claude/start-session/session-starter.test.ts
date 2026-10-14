import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRunner, type NulledCommandResult } from "../../infrastructure/command-runner";
import { SessionStarter } from "./session-starter";

const CLI = "/Users/someone/.local/bin/claude";
const HOME = "/Users/someone";

test("opens the project folder in Claude Desktop through a pseudo-terminal", async () => {
	const { commands } = await start("/Users/someone/projects/toolkit");

	assert.deepEqual(commands.data, [
		{ command: "/usr/bin/script", args: ["-q", "/dev/null", CLI, "--desktop"], timeoutMs: 30_000, cwd: "/Users/someone/projects/toolkit" },
	]);
});

test("expands ~ to the home folder", async () => {
	const { commands } = await start("~/projects/toolkit");

	assert.equal(commands.data[0].cwd, "/Users/someone/projects/toolkit");
});

test("fails, sending nothing, when no project folder is set", async () => {
	const runner = CommandRunner.createNull();
	const commands = runner.trackCommands();
	const starter = new SessionStarter(runner, () => CLI, HOME);

	await assert.rejects(starter.start(""), { message: "No project folder set for this key" });
	assert.deepEqual(commands.data, []);
});

async function start(projectFolder: string | undefined, result?: NulledCommandResult) {
	const runner = CommandRunner.createNull(result);
	const commands = runner.trackCommands();
	const starter = new SessionStarter(runner, () => CLI, HOME);

	await starter.start(projectFolder);

	return { commands };
}
