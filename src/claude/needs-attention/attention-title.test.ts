import assert from "node:assert/strict";
import { test } from "node:test";
import { attentionTitle } from "./attention-title";

test("a permission prompt reads Approve with how long it has waited", () => {
	assert.equal(attentionTitle({ for: "permission", since: 1_000 }, 6_000), "Approve\n00:05");
});

test("waiting for input reads Reply with how long it has waited", () => {
	assert.equal(attentionTitle({ for: "input", since: 1_000 }, 91_000), "Reply\n01:30");
});
