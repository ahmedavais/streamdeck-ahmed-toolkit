import { HttpClient, type HttpRequest, type HttpResponse, type NulledHttpResponse } from "../../infrastructure/http-client";
import { Log } from "../../infrastructure/log";
import { ClaudeCredentials } from "./claude-credentials";
import { parseSnapshot, RateLimitSnapshot } from "./parse-snapshot";

const API_URL = "https://api.anthropic.com/v1/messages";
const PROBE_MODEL = "claude-haiku-4-5-20251001";

export class RateLimitClient {
	static create(): RateLimitClient {
		return new RateLimitClient(HttpClient.create(), ClaudeCredentials.create(), Log.create());
	}

	static createNull(reading?: RateLimitSnapshot): RateLimitClient {
		const http = reading ? HttpClient.createNull(probeResponseReporting(reading)) : HttpClient.createNull();
		return new RateLimitClient(http, ClaudeCredentials.createNull(), Log.createNull());
	}

	constructor(
		private readonly http: HttpClient,
		private readonly credentials: ClaudeCredentials,
		private readonly log: Log,
	) {}

	async fetchSnapshot(): Promise<RateLimitSnapshot | undefined> {
		try {
			return await this.probe();
		} catch (failure) {
			this.log.error(`Claude Code rate-limit probe failed: ${(failure as Error).message}`);
			return undefined;
		}
	}

	private async probe(): Promise<RateLimitSnapshot | undefined> {
		const response = await this.http.request(probeRequestWith(this.credentials.accessToken()));
		return this.snapshotFrom(response);
	}

	private snapshotFrom(response: HttpResponse): RateLimitSnapshot | undefined {
		if (response.status === 401) {
			this.credentials.forgetToken();
			this.log.error("Claude Code Keychain token rejected; will re-read on next poll.");
			return undefined;
		}

		if (response.status < 200 || response.status >= 300) {
			this.log.error(`Claude Code rate-limit probe failed with status ${response.status}`);
			return undefined;
		}

		return parseSnapshot(new Headers(response.headers));
	}
}

function probeRequestWith(accessToken: string): HttpRequest {
	return {
		url: API_URL,
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"anthropic-version": "2023-06-01",
			"anthropic-beta": "oauth-2025-04-20",
			"content-type": "application/json",
		},
		body: JSON.stringify({
			model: PROBE_MODEL,
			max_tokens: 1,
			messages: [{ role: "user", content: "." }],
		}),
	};
}

function probeResponseReporting({ usage }: RateLimitSnapshot): NulledHttpResponse {
	return { status: 200, headers: { "anthropic-ratelimit-unified-7d-utilization": String(usage) }, body: "{}" };
}
