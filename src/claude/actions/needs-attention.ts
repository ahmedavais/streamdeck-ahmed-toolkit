import { action } from "@elgato/streamdeck";
import { renderStateImage } from "../../key-image/state-image";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { attentionTitle } from "../needs-attention/attention-title";
import { mostUrgentWaiting } from "../needs-attention/waiting-state";
import type { Waiting } from "../sessions/session";
import { readSessions } from "../sessions/session-store";

const TICK_INTERVAL_MS = 1_000;
const NOBODY_WAITING_COLOR = "#3a3a42";

const COLOR_BY_WAITING: Record<Waiting["for"], string> = {
	permission: "#d96a1e",
	input: "#c08a1e",
};

@action({ UUID: "com.ahmedavais.toolkit.claude.needs-attention" })
export class NeedsAttention extends PollingKeyAction {
	constructor() {
		super({ name: "needs attention", everyMs: TICK_INTERVAL_MS });
	}

	protected override async check(): Promise<KeyDisplay> {
		const waiting = mostUrgentWaiting(readSessions());
		if (!waiting) return { title: "", image: renderStateImage(NOBODY_WAITING_COLOR) };

		return { title: attentionTitle(waiting, Date.now()), image: renderStateImage(COLOR_BY_WAITING[waiting.for]) };
	}
}
