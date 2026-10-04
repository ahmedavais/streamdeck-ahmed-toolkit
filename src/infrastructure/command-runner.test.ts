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
