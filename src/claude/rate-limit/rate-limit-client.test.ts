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

async function fetchSnapshot({
	credentials = { accessToken: "irrelevant token" } as NulledCredentials | NulledCredentials[],
	httpResponses = IRRELEVANT_RESPONSE as NulledHttpResponse | NulledHttpResponse[],
} = {}) {
	const http = HttpClient.createNull(httpResponses);
	const httpRequests = http.trackRequests();
	const log = Log.createNull();
	const logOutput = log.trackOutput();
	const client = new RateLimitClient(http, ClaudeCredentials.createNull(credentials), log);

	const snapshot = await client.fetchSnapshot();

	return { snapshot, httpRequests, logOutput };
}
