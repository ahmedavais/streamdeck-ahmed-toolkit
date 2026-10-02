import assert from "node:assert/strict";
import { test } from "node:test";
import { Keychain } from "../../infrastructure/keychain";
import { ClaudeCredentials } from "./claude-credentials";

test("reads the access token from Claude Code's Keychain entry", () => {
	const keychain = Keychain.createNull({ password: credentialsHolding("token-123") });
	const reads = keychain.trackReads();
	const credentials = new ClaudeCredentials(keychain);

	const token = credentials.accessToken();

	assert.equal(token, "token-123");
	assert.deepEqual(reads.data, [{ service: "Claude Code-credentials" }]);
});

function credentialsHolding(accessToken: string): string {
	return JSON.stringify({ claudeAiOauth: { accessToken, refreshToken: "irrelevant refresh token" } });
}
