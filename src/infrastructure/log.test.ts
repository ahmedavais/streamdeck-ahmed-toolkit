import assert from "node:assert/strict";
import { test } from "node:test";
import { Log } from "./log";

test("records the errors it logs", () => {
	const log = Log.createNull();
	const output = log.trackOutput();

	log.error("Something broke");

	assert.deepEqual(output.data, [{ level: "error", message: "Something broke" }]);
});

test("records the information it logs", () => {
	const log = Log.createNull();
	const output = log.trackOutput();

	log.info("Something worth knowing");

	assert.deepEqual(output.data, [{ level: "info", message: "Something worth knowing" }]);
});
