import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpClient, type NulledHttpResponse } from "../../infrastructure/http-client";
import { Log } from "../../infrastructure/log";
import { ClaudeCredentials, type NulledCredentials } from "./claude-credentials";
import { RateLimitClient } from "./rate-limit-client";

const IRRELEVANT_RESPONSE: NulledHttpResponse = { status: 200, headers: {}, body: "{}" };

test("sends a one-token Haiku probe authorized with the Claude Code token", async () => {
	const { httpRequests } = await fetchSnapshot({ credentials: { accessToken: "token-123" } });

	assert.deepEqual(httpRequests.data, [
		{
			url: "https://api.anthropic.com/v1/messages",
			method: "POST",
			headers: {
				Authorization: "Bearer token-123",
				"anthropic-version": "2023-06-01",
				"anthropic-beta": "oauth-2025-04-20",
				"content-type": "application/json",
			},
			body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1, messages: [{ role: "user", content: "." }] }),
		},
	]);
});

test("reports the snapshot from the probe's rate-limit headers", async () => {
	const { snapshot } = await fetchSnapshot({
		httpResponses: { status: 200, headers: { "anthropic-ratelimit-unified-7d-utilization": "0.42" }, body: "{}" },
	});

	assert.deepEqual(snapshot, { usage: 0.42 });
});

test("reports nothing and logs why when the network is unreachable", async () => {
	const { snapshot, logOutput } = await fetchSnapshot({ httpResponses: { networkError: "getaddrinfo ENOTFOUND api.anthropic.com" } });

	assert.equal(snapshot, undefined);
	assert.deepEqual(logOutput.data, [
		{
			level: "error",
			message: "Claude Code rate-limit probe failed: POST https://api.anthropic.com/v1/messages failed: getaddrinfo ENOTFOUND api.anthropic.com",
		},
	]);
});

test("reports nothing, sends nothing, and logs why when Claude Code's credentials can't be read", async () => {
	const { snapshot, httpRequests, logOutput } = await fetchSnapshot({ credentials: { missing: true } });

	assert.equal(snapshot, undefined);
	assert.deepEqual(httpRequests.data, [], "shouldn't probe without a token");
	assert.deepEqual(logOutput.data, [
		{
			level: "error",
			message:
				'Claude Code rate-limit probe failed: Could not read "Claude Code-credentials" from the Keychain: security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.',
		},
	]);
});

test("reports nothing, logs why, and reads a fresh token when the token is rejected", async () => {
	const { snapshots, httpRequests, logOutput } = await fetchSnapshot({
		credentials: [{ accessToken: "expired" }, { accessToken: "fresh" }],
		httpResponses: [{ status: 401, headers: {}, body: "{}" }, IRRELEVANT_RESPONSE],
		probes: 2,
	});

	assert.equal(snapshots[0], undefined);
	assert.deepEqual(logOutput.data, [{ level: "error", message: "Claude Code Keychain token rejected; will re-read on next poll." }]);
	assert.deepEqual(
		httpRequests.data.map(({ headers }) => headers.Authorization),
		["Bearer expired", "Bearer fresh"],
	);
});

test("reports nothing and logs why when the probe fails with another status", async () => {
	const { snapshot, logOutput } = await fetchSnapshot({
		httpResponses: { status: 529, headers: { "anthropic-ratelimit-unified-7d-utilization": "0.42" }, body: "overloaded" },
	});

	assert.equal(snapshot, undefined);
	assert.deepEqual(logOutput.data, [{ level: "error", message: "Claude Code rate-limit probe failed with status 529" }]);
});

test("a nulled client reports the configured usage", async () => {
	const client = RateLimitClient.createNull({ usage: 0.42 });

	assert.deepEqual(await client.fetchSnapshot(), { usage: 0.42 });
});

async function fetchSnapshot({
	credentials = { accessToken: "irrelevant token" } as NulledCredentials | NulledCredentials[],
	httpResponses = IRRELEVANT_RESPONSE as NulledHttpResponse | NulledHttpResponse[],
	probes = 1,
} = {}) {
	const http = HttpClient.createNull(httpResponses);
	const httpRequests = http.trackRequests();
	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const client = new RateLimitClient(http, ClaudeCredentials.createNull(credentials), log);

	const snapshots = [];
	for (let probe = 0; probe < probes; probe++) snapshots.push(await client.fetchSnapshot());

	return { snapshot: snapshots.at(-1), snapshots, httpRequests, logOutput };
}
