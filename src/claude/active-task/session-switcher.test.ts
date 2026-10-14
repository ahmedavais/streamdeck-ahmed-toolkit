import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRunner } from "../../infrastructure/command-runner";
import { SessionSwitcher } from "./session-switcher";

test("brings the session's app to the front", async () => {
	const runner = CommandRunner.createNull();
	const commands = runner.trackCommands();
	const switcher = new SessionSwitcher(runner);

	await switcher.bringForward({ turnStartedAt: 1_000, hostApp: "com.anthropic.claudefordesktop" });

	assert.deepEqual(commands.data, [{ command: "/usr/bin/open", args: ["-b", "com.anthropic.claudefordesktop"], timeoutMs: 5_000 }]);
});

test("does nothing for a session whose app is unknown", async () => {
	const runner = CommandRunner.createNull();
	const commands = runner.trackCommands();
	const switcher = new SessionSwitcher(runner);

	await switcher.bringForward({ turnStartedAt: 1_000 });

	assert.deepEqual(commands.data, []);
});

test("fails, naming the app, when it can't be brought forward", async () => {
	const switcher = new SessionSwitcher(CommandRunner.createNull({ stdout: "", exitCode: 1, timedOut: false }));

	await assert.rejects(switcher.bringForward({ turnStartedAt: 1_000, hostApp: "com.example.gone" }), {
		message: "Could not bring com.example.gone to the front: open exited with code 1",
	});
});

test("fails, saying so, when bringing the app forward times out", async () => {
	const switcher = new SessionSwitcher(CommandRunner.createNull({ stdout: "", exitCode: null, timedOut: true }));

	await assert.rejects(switcher.bringForward({ turnStartedAt: 1_000, hostApp: "com.example.stuck" }), {
		message: "Could not bring com.example.stuck to the front: open timed out after 5s",
	});
});
