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

export class HttpClient {
	static create(): HttpClient {
		return new HttpClient();
	}

	async request({ url, method, headers, body }: HttpRequest): Promise<HttpResponse> {
		const response = await fetch(url, { method, headers, body }).catch((failure: Error) => {
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
