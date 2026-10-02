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

test("reads the Keychain only once across calls", () => {
	const keychain = Keychain.createNull({ password: credentialsHolding("token-123") });
	const reads = keychain.trackReads();
	const credentials = new ClaudeCredentials(keychain);

	const tokens = [credentials.accessToken(), credentials.accessToken()];

	assert.deepEqual(tokens, ["token-123", "token-123"]);
	assert.equal(reads.data.length, 1);
});

test("reads the Keychain again after the token is forgotten", () => {
	const keychain = Keychain.createNull({ password: credentialsHolding("token-123") });
	const reads = keychain.trackReads();
	const credentials = new ClaudeCredentials(keychain);
	credentials.accessToken();

	credentials.forgetToken();
	credentials.accessToken();

	assert.equal(reads.data.length, 2);
});

test("fails clearly when the Keychain entry isn't JSON", () => {
	const credentials = new ClaudeCredentials(Keychain.createNull({ password: "not json" }));

	assert.throws(() => credentials.accessToken(), { message: "Claude Code's Keychain entry holds no access token" });
});

test("fails clearly when the Keychain entry has no access token", () => {
	const credentials = new ClaudeCredentials(Keychain.createNull({ password: JSON.stringify({ claudeAiOauth: {} }) }));

	assert.throws(() => credentials.accessToken(), { message: "Claude Code's Keychain entry holds no access token" });
});

test("a nulled instance answers with an obviously fake default token", () => {
	const credentials = ClaudeCredentials.createNull();

	assert.equal(credentials.accessToken(), "Nulled ClaudeCredentials access token");
});

test("a nulled instance answers with configured tokens in order", () => {
	const credentials = ClaudeCredentials.createNull([{ accessToken: "old" }, { accessToken: "new" }]);

	const first = credentials.accessToken();
	credentials.forgetToken();
	const second = credentials.accessToken();

	assert.deepEqual([first, second], ["old", "new"]);
});

function credentialsHolding(accessToken: string): string {
	return JSON.stringify({ claudeAiOauth: { accessToken, refreshToken: "irrelevant refresh token" } });
}
