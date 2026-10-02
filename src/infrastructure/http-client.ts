import { ConfigurableResponses } from "./configurable-responses";
import { OutputListener, type OutputTracker } from "./output-listener";

export type HttpRequest = {
	url: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
};

export type HttpResponse = {
	status: number;
	headers: Record<string, string>;
	body: string;
};

export type NulledHttpResponse = HttpResponse | { networkError: string };

type Fetch = typeof fetch;

export class HttpClient {
	static create(): HttpClient {
		return new HttpClient(fetch);
	}

	static createNull(responses: NulledHttpResponse | NulledHttpResponse[] = DEFAULT_NULLED_RESPONSE): HttpClient {
		return new HttpClient(stubbedFetch(ConfigurableResponses.create(responses, "nulled HttpClient")));
	}

	private readonly requests = new OutputListener<HttpRequest>();

	constructor(private readonly fetch: Fetch) {}

	trackRequests(): OutputTracker<HttpRequest> {
		return this.requests.trackOutput();
	}

	async request(request: HttpRequest): Promise<HttpResponse> {
		this.requests.emit(request);
		const response = await this.send(request);
		return {
			status: response.status,
			headers: Object.fromEntries(response.headers.entries()),
			body: await response.text(),
		};
	}

	private async send({ url, method, headers, body }: HttpRequest): Promise<Response> {
		try {
			return await this.fetch(url, { method, headers, body });
		} catch (failure) {
			throw new Error(`${method} ${url} failed: ${reasonFor(failure as Error)}`, { cause: failure });
		}
	}
}

function reasonFor(failure: Error): string {
	return failure.cause instanceof Error ? failure.cause.message : failure.message;
}

const DEFAULT_NULLED_RESPONSE: HttpResponse = {
	status: 503,
	headers: { nulledhttpclient: "default header" },
	body: "Nulled HttpClient default body",
};

function stubbedFetch(responses: ConfigurableResponses<NulledHttpResponse>): Fetch {
	return async () => {
		const response = responses.next();
		if ("networkError" in response) throw new TypeError("fetch failed", { cause: new Error(response.networkError) });
		return new Response(response.body, { status: response.status, headers: response.headers });
	};
}
