import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRunner } from "./command-runner";

const IRRELEVANT_TIMEOUT_MS = 10_000;

test("returns the output of a command that succeeds", async () => {
	const runner = CommandRunner.create();

	const result = await runner.run(process.execPath, ["-e", "process.stdout.write('all good')"], IRRELEVANT_TIMEOUT_MS);

	assert.deepEqual(result, { stdout: "all good", exitCode: 0, timedOut: false });
});
