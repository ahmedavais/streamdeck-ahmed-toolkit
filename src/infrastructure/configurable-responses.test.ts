import assert from "node:assert/strict";
import { test } from "node:test";
import { ConfigurableResponses } from "./configurable-responses";

test("a single response repeats forever", () => {
	const responses = ConfigurableResponses.create("same");

	const answers = [responses.next(), responses.next(), responses.next()];

	assert.deepEqual(answers, ["same", "same", "same"]);
});
