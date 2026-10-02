export class ConfigurableResponses<T> {
	static create<T>(responses: T | T[], owner: string): ConfigurableResponses<T> {
		return new ConfigurableResponses(Array.isArray(responses) ? inOrder(responses, owner) : () => responses);
	}

	constructor(private readonly nextResponse: () => T) {}

	next(): T {
		return this.nextResponse();
	}
}

function inOrder<T>(responses: T[], owner: string): () => T {
	const remaining = [...responses];
	return () => {
		if (remaining.length === 0) throw new Error(`No more responses configured in ${owner}`);
		return remaining.shift() as T;
	};
}
