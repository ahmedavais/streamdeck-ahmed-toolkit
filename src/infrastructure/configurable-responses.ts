export class ConfigurableResponses<T> {
	static create<T>(response: T): ConfigurableResponses<T> {
		return new ConfigurableResponses(response);
	}

	constructor(private readonly response: T) {}

	next(): T {
		return this.response;
	}
}
