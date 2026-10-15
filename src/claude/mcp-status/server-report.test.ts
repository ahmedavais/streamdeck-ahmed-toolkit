import assert from "node:assert/strict";
import { test } from "node:test";
import { Log } from "../../infrastructure/log";
import { reportServers, ServerReporter } from "./server-report";

const HEARTBEAT_MS = 60 * 60 * 1000;
const connected = [{ name: "Slack", health: "connected" as const }];
const needsAuthentication = [{ name: "Slack", health: "needs-authentication" as const }];

test("says how many servers are connected when all are", () => {
	const statuses = [
		{ name: "Slack", health: "connected" as const },
		{ name: "Gmail", health: "connected" as const },
	];

	assert.equal(reportServers(statuses), "MCP servers all connected: 2");
});

test("names the servers that are not connected", () => {
	const statuses = [
		{ name: "Slack", health: "connected" as const },
		{ name: "Drata", health: "needs-authentication" as const },
		{ name: "broken", health: "failed" as const },
	];

	assert.equal(reportServers(statuses), "MCP servers not connected: Drata (needs-authentication), broken (failed)");
});

test("says no servers are in use when there are none", () => {
	assert.equal(reportServers([]), "No MCP servers in use");
});

test("logs the first report", () => {
	const { reporter, logged } = createReporter();

	reporter.report(connected);

	assert.deepEqual(logged(), ["MCP servers all connected: 1"]);
});

test("stays quiet while nothing changes", () => {
	const { reporter, logged, advance } = createReporter();

	reporter.report(connected);
	advance(45 * 1000);
	reporter.report(connected);

	assert.equal(logged().length, 1);
});

test("logs again when the servers change", () => {
	const { reporter, logged, advance } = createReporter();

	reporter.report(connected);
	advance(45 * 1000);
	reporter.report(needsAuthentication);

	assert.deepEqual(logged(), ["MCP servers all connected: 1", "MCP servers not connected: Slack (needs-authentication)"]);
});

test("logs a heartbeat once the interval has passed without a change", () => {
	const { reporter, logged, advance } = createReporter();

	reporter.report(connected);
	advance(HEARTBEAT_MS);
	reporter.report(connected);

	assert.equal(logged().length, 2);
});

test("counts the heartbeat interval from the last line logged", () => {
	const { reporter, logged, advance } = createReporter();

	reporter.report(connected);
	advance(HEARTBEAT_MS - 1);
	reporter.report(connected);
	advance(HEARTBEAT_MS - 1);
	reporter.report(connected);

	assert.equal(logged().length, 2);
});

function createReporter() {
	const log = Log.createNull();
	const output = log.trackOutput();
	let now = 0;
	const reporter = new ServerReporter(log, HEARTBEAT_MS, () => now);

	return {
		reporter,
		logged: () => output.data.map(({ message }) => message),
		advance: (ms: number) => {
			now += ms;
		},
	};
}
