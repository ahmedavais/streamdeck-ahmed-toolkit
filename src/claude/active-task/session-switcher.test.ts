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
