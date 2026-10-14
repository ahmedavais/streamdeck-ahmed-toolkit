import { action, KeyDownEvent } from "@elgato/streamdeck";
import { Log } from "../../infrastructure/log";
import { renderStateImage } from "../../key-image/state-image";
import { formatElapsed } from "../../key-title/elapsed";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { SessionSwitcher } from "../active-task/session-switcher";
import { chooseTurnToDisplay, elapsedOf, isInProgress } from "../active-task/turn-state";
import { readLiveSessions } from "../sessions/live-sessions";

const TICK_INTERVAL_MS = 1_000;
const IDLE_COLOR = "#3a3a42";
const WORKING_COLOR = "#2f6fed";

@action({ UUID: "com.ahmedavais.toolkit.claude.active-task" })
export class ActiveTask extends PollingKeyAction {
	private readonly log = Log.create();
	private readonly switcher = SessionSwitcher.create();

	constructor() {
		super({ name: "active task", everyMs: TICK_INTERVAL_MS });
	}

	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		const sessions = readLiveSessions();
		const displayed = chooseTurnToDisplay(sessions);
		if (!displayed) return;

		try {
			await this.switcher.bringForward(sessions[displayed.sessionId]);
		} catch (failure) {
			this.log.error((failure as Error).message);
			await ev.action.showAlert();
		}
	}

	protected override async check(): Promise<KeyDisplay> {
		const displayed = chooseTurnToDisplay(readLiveSessions());
		if (!displayed) return { title: "", image: renderStateImage(IDLE_COLOR) };

		const { turn } = displayed;
		return {
			title: formatElapsed(elapsedOf(turn, Date.now())),
			image: renderStateImage(isInProgress(turn) ? WORKING_COLOR : IDLE_COLOR),
		};
	}
}
