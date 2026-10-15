import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { CommandRunner } from "./command-runner";

const IRRELEVANT_TIMEOUT_MS = 10_000;

test("returns the output of a command that succeeds", async () => {
	const runner = CommandRunner.create();

	const result = await runner.run(process.execPath, ["-e", "process.stdout.write('all good')"], IRRELEVANT_TIMEOUT_MS);

	assert.deepEqual(result, { stdout: "all good", exitCode: 0, timedOut: false });
});

test("returns the output and exit code of a command that fails", async () => {
	const runner = CommandRunner.create();

	const result = await runner.run(process.execPath, ["-e", "process.stdout.write('partial'); process.exit(3)"], IRRELEVANT_TIMEOUT_MS);

	assert.deepEqual(result, { stdout: "partial", exitCode: 3, timedOut: false });
});

test("returns the partial output of a command that runs past its timeout", async () => {
	const runner = CommandRunner.create();

	const result = await runner.run(process.execPath, ["-e", "process.stdout.write('slow start'); setTimeout(() => {}, 10_000)"], 300);

	assert.deepEqual(result, { stdout: "slow start", exitCode: null, timedOut: true });
});

test("fails, naming the command, when it can't be started", async () => {
	const runner = CommandRunner.create();

	await assert.rejects(runner.run("/no/such/command", [], IRRELEVANT_TIMEOUT_MS), {
		message: "Could not run /no/such/command: spawn /no/such/command ENOENT",
	});
});

test("a nulled runner starts no processes", async () => {
	const runner = CommandRunner.createNull();
	const marker = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "toolkit-runner-")), "ran");

	await runner.run(process.execPath, ["-e", `require("fs").writeFileSync(${JSON.stringify(marker)}, "")`], IRRELEVANT_TIMEOUT_MS);

	assert.equal(fs.existsSync(marker), false);
});

test("a nulled runner answers with an obviously fake default", async () => {
	const runner = CommandRunner.createNull();

	const result = await runner.run("anything", [], IRRELEVANT_TIMEOUT_MS);

	assert.deepEqual(result, { stdout: "Nulled CommandRunner default output", exitCode: 0, timedOut: false });
});

test("a nulled runner answers configured results in order", async () => {
	const runner = CommandRunner.createNull([
		{ stdout: "first", exitCode: 0, timedOut: false },
		{ stdout: "partial", exitCode: 1, timedOut: false },
		{ stdout: "slow", exitCode: null, timedOut: true },
	]);

	const results = [
		await runner.run("anything", [], IRRELEVANT_TIMEOUT_MS),
		await runner.run("anything", [], IRRELEVANT_TIMEOUT_MS),
		await runner.run("anything", [], IRRELEVANT_TIMEOUT_MS),
	];

	assert.deepEqual(results, [
		{ stdout: "first", exitCode: 0, timedOut: false },
		{ stdout: "partial", exitCode: 1, timedOut: false },
		{ stdout: "slow", exitCode: null, timedOut: true },
	]);
});

test("a nulled runner can fail to start a command", async () => {
	const runner = CommandRunner.createNull({ cannotStart: true });

	await assert.rejects(runner.run("/usr/local/bin/claude", [], IRRELEVANT_TIMEOUT_MS), {
		message: "Could not run /usr/local/bin/claude: spawn /usr/local/bin/claude ENOENT",
	});
});

test("tracks the commands it runs", async () => {
	const runner = CommandRunner.createNull();
	const commands = runner.trackCommands();

	await runner.run("/usr/local/bin/claude", ["mcp", "list"], 40_000);

	assert.deepEqual(commands.data, [{ command: "/usr/local/bin/claude", args: ["mcp", "list"], timeoutMs: 40_000 }]);
});
