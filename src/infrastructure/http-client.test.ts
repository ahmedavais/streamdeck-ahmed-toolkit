import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, test } from "node:test";
import { HttpClient } from "./http-client";

type SeenRequest = { method: string; path: string; headers: http.IncomingHttpHeaders; body: string };
type ServerResponse = { status: number; headers: Record<string, string>; body: string };

const UNSPECIFIED_RESPONSE: ServerResponse = { status: 501, headers: {}, body: "SpyServer response not specified" };

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

test("returns the real server's response", async () => {
	const client = HttpClient.create();
	spyServer.respondWith({ status: 429, headers: { "x-quota": "spent" }, body: "slow down" });

	const response = await client.request({ url: spyServer.url(), method: "GET", headers: {} });

	assert.deepEqual(
		{ status: response.status, quota: response.headers["x-quota"], body: response.body },
		{ status: 429, quota: "spent", body: "slow down" },
	);
});

test("fails with the address when the server is unreachable", async () => {
	const client = HttpClient.create();
	const port = await closedPort();

	await assert.rejects(client.request({ url: `http://127.0.0.1:${port}/v1/probe`, method: "GET", headers: {} }), {
		message: `GET http://127.0.0.1:${port}/v1/probe failed: connect ECONNREFUSED 127.0.0.1:${port}`,
	});
});

test("fails with the library's reason when it refuses the request", async () => {
	const client = HttpClient.create();

	await assert.rejects(client.request({ url: spyServer.url(), method: "GET", headers: {}, body: "not allowed" }), {
		message: `GET ${spyServer.url()} failed: Request with GET/HEAD method cannot have body.`,
	});
});

test("a nulled client doesn't touch the network", async () => {
	const client = HttpClient.createNull();

	await client.request({ url: spyServer.url(), method: "POST", headers: {}, body: "{}" });

	assert.equal(spyServer.lastRequest(), null);
});

async function closedPort(): Promise<number> {
	const server = http.createServer();
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const { port } = server.address() as AddressInfo;
	await new Promise<void>((resolve) => server.close(() => resolve()));
	return port;
}

function createSpyServer() {
	let lastRequest: SeenRequest | null = null;
	let nextResponse = UNSPECIFIED_RESPONSE;
	const server = http.createServer((request, response) => {
		let body = "";
		request.on("data", (chunk) => (body += chunk));
		request.on("end", () => {
			lastRequest = { method: request.method ?? "", path: request.url ?? "", headers: headersWithoutNoise(request.headers), body };
			response.writeHead(nextResponse.status, nextResponse.headers).end(nextResponse.body);
		});
	});

	return {
		start: () => new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve)),
		stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
		reset: () => {
			lastRequest = null;
			nextResponse = UNSPECIFIED_RESPONSE;
		},
		respondWith: (response: ServerResponse) => (nextResponse = response),
		url: () => `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
		lastRequest: () => lastRequest,
	};
}

const HEADERS_FETCH_ADDS_ON_ITS_OWN = ["host", "connection", "content-length", "user-agent", "accept", "accept-encoding", "accept-language", "sec-fetch-mode"];

function headersWithoutNoise(headers: http.IncomingHttpHeaders): http.IncomingHttpHeaders {
	return Object.fromEntries(Object.entries(headers).filter(([name]) => !HEADERS_FETCH_ADDS_ON_ITS_OWN.includes(name)));
}
