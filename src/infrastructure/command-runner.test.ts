import assert from "node:assert/strict";
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
