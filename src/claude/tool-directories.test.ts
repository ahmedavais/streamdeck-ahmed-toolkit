import assert from "node:assert/strict";
import { test } from "node:test";
import { toolDirectories } from "./tool-directories";

test("lists where command-line tools get installed, the user's own directory first", () => {
	const directories = toolDirectories("/Users/someone");

	assert.deepEqual(directories, ["/Users/someone/.local/bin", "/opt/homebrew/bin", "/usr/local/bin"]);
});
