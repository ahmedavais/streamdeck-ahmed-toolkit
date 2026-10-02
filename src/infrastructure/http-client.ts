export type HttpRequest = {
	url: string;
	method: string;
	headers: Record<string, string>;
	body: string;
};

export class HttpClient {
	static create(): HttpClient {
		return new HttpClient();
	}

	async request({ url, method, headers, body }: HttpRequest): Promise<void> {
		await fetch(url, { method, headers, body });
	}
}
