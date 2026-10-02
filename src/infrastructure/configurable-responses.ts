export class ConfigurableResponses<T> {
	static create<T>(responses: T | T[]): ConfigurableResponses<T> {
		return new ConfigurableResponses(Array.isArray(responses) ? inOrder(responses) : () => responses);
	}

	constructor(private readonly nextResponse: () => T) {}

	next(): T {
		return this.nextResponse();
	}
}

function inOrder<T>(responses: T[]): () => T {
	const remaining = [...responses];
	return () => remaining.shift() as T;
}
