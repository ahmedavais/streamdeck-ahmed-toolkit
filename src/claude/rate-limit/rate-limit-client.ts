import streamDeck from "@elgato/streamdeck";
import { getAccessToken, invalidateAccessToken } from "./keychain-token";
import { parseSnapshot, RateLimitSnapshot } from "./parse-snapshot";

const API_URL = "https://api.anthropic.com/v1/messages";
const PROBE_MODEL = "claude-haiku-4-5-20251001";

export async function fetchRateLimitSnapshot(): Promise<RateLimitSnapshot | undefined> {
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${getAccessToken()}`,
			"anthropic-version": "2023-06-01",
			"anthropic-beta": "oauth-2025-04-20",
			"content-type": "application/json",
		},
		body: JSON.stringify({
			model: PROBE_MODEL,
			max_tokens: 1,
			messages: [{ role: "user", content: "." }],
		}),
	});

	if (response.status === 401) {
		invalidateAccessToken();
		streamDeck.logger.error("Claude Code Keychain token rejected; will re-read on next poll.");
		return undefined;
	}

	if (!response.ok) {
		streamDeck.logger.error(`Claude Code rate-limit probe failed with status ${response.status}`);
		return undefined;
	}

	return parseSnapshot(response.headers);
}
