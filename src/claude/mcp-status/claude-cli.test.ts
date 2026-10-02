import assert from "node:assert/strict";
import { test } from "node:test";
import { pickClaudeCli } from "./claude-cli";

test("uses the first candidate that exists on disk", () => {
	const exists = (path: string) => path === "/Users/someone/.local/bin/claude";

	assert.equal(pickClaudeCli(["/opt/homebrew/bin/claude", "/Users/someone/.local/bin/claude"], exists), "/Users/someone/.local/bin/claude");
});

test("falls back to a bare command so PATH can resolve it", () => {
	assert.equal(
		pickClaudeCli(["/opt/homebrew/bin/claude"], () => false),
		"claude",
	);
});
