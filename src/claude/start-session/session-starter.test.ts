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

test("fails, naming the folder, when the CLI exits with an error", async () => {
	await assert.rejects(start("/Users/someone/gone", { stdout: "", exitCode: 1, timedOut: false }), {
		message: "Could not open /Users/someone/gone in Claude Desktop: claude exited with code 1",
	});
});

test("includes what the CLI printed, without terminal control characters", async () => {
	const printed = "\x04\b\b--desktop requires signing in with a Claude account.\r\n\x1b[?25h";

	await assert.rejects(start("/Users/someone/project", { stdout: printed, exitCode: 1, timedOut: false }), {
		message: "Could not open /Users/someone/project in Claude Desktop: claude exited with code 1: --desktop requires signing in with a Claude account.",
	});
});

test("fails, saying so, when opening times out", async () => {
	await assert.rejects(start("/Users/someone/project", { stdout: "", exitCode: null, timedOut: true }), {
		message: "Could not open /Users/someone/project in Claude Desktop: claude timed out after 30s",
	});
});

async function start(projectFolder: string | undefined, result?: NulledCommandResult) {
	const runner = CommandRunner.createNull(result);
	const commands = runner.trackCommands();
	const starter = new SessionStarter(runner, () => CLI, HOME);

	await starter.start(projectFolder);

	return { commands };
}
