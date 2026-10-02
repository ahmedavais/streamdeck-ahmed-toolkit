import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, test } from "node:test";
import { HttpClient } from "./http-client";

type SeenRequest = { method: string; path: string; headers: http.IncomingHttpHeaders; body: string };

const spyServer = createSpyServer();

before(() => spyServer.start());
after(() => spyServer.stop());
beforeEach(() => spyServer.reset());

test("sends the request to a real server", async () => {
	const client = HttpClient.create();

	await client.request({
		url: `${spyServer.url()}/v1/probe`,
		method: "POST",
		headers: { "content-type": "application/json" },
		body: "{}",
	});

	assert.deepEqual(spyServer.lastRequest(), {
		method: "POST",
		path: "/v1/probe",
		headers: { "content-type": "application/json" },
		body: "{}",
	});
});

function createSpyServer() {
	let lastRequest: SeenRequest | null = null;
	const server = http.createServer((request, response) => {
		let body = "";
		request.on("data", (chunk) => (body += chunk));
		request.on("end", () => {
			lastRequest = { method: request.method ?? "", path: request.url ?? "", headers: headersWithoutNoise(request.headers), body };
			response.end();
		});
	});

	return {
		start: () => new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve)),
		stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
		reset: () => (lastRequest = null),
		url: () => `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
		lastRequest: () => lastRequest,
	};
}

const HEADERS_FETCH_ADDS_ON_ITS_OWN = ["host", "connection", "content-length", "user-agent", "accept", "accept-encoding", "accept-language", "sec-fetch-mode"];

function headersWithoutNoise(headers: http.IncomingHttpHeaders): http.IncomingHttpHeaders {
	return Object.fromEntries(Object.entries(headers).filter(([name]) => !HEADERS_FETCH_ADDS_ON_ITS_OWN.includes(name)));
}
