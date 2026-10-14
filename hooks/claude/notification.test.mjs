import assert from "node:assert/strict";
import { test } from "node:test";
import { waitingReasonFor } from "./notification.mjs";

test("a permission prompt notification means waiting for permission", () => {
	assert.equal(waitingReasonFor("permission_prompt"), "permission");
});

test("an idle prompt notification means waiting for input", () => {
	assert.equal(waitingReasonFor("idle_prompt"), "input");
});
