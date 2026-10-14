import assert from "node:assert/strict";
import { test } from "node:test";
import { attentionTitle } from "./attention-title";

test("a permission prompt reads Approve with how long it has waited", () => {
	assert.equal(attentionTitle({ for: "permission", since: 1_000 }, 6_000), "Approve\n00:05");
});
