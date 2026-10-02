import { ConfigurableResponses } from "./configurable-responses";

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

type Fetch = typeof fetch;

export class HttpClient {
	static create(): HttpClient {
		return new HttpClient(fetch);
	}

	static createNull(responses: HttpResponse | HttpResponse[] = DEFAULT_NULLED_RESPONSE): HttpClient {
		return new HttpClient(stubbedFetch(ConfigurableResponses.create(responses, "nulled HttpClient")));
	}

	constructor(private readonly fetch: Fetch) {}

	async request({ url, method, headers, body }: HttpRequest): Promise<HttpResponse> {
		const response = await this.fetch(url, { method, headers, body }).catch((failure: Error) => {
			throw new Error(`${method} ${url} failed: ${reasonFor(failure)}`, { cause: failure });
		});
		return {
			status: response.status,
			headers: Object.fromEntries(response.headers.entries()),
			body: await response.text(),
		};
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

function stubbedFetch(responses: ConfigurableResponses<HttpResponse>): Fetch {
	return async () => {
		const { status, headers, body } = responses.next();
		return new Response(body, { status, headers });
	};
}
