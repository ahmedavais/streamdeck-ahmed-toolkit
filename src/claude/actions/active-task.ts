import { action } from "@elgato/streamdeck";
import { renderStateImage } from "../../key-image/state-image";
import type { KeyDisplay } from "../../polling-key/poller";
import { PollingKeyAction } from "../../polling-key/polling-key-action";
import { formatElapsed } from "../active-task/elapsed";
import { chooseTurnToDisplay, elapsedOf, isInProgress } from "../active-task/turn-state";
import { readTurnState } from "../active-task/turn-store";

const TICK_INTERVAL_MS = 1_000;
const IDLE_COLOR = "#3a3a42";
const WORKING_COLOR = "#2f6fed";

@action({ UUID: "com.ahmedavais.toolkit.claude.active-task" })
export class ActiveTask extends PollingKeyAction {
	constructor() {
		super({ name: "active task", everyMs: TICK_INTERVAL_MS });
	}

	protected override async check(): Promise<KeyDisplay> {
		const displayed = chooseTurnToDisplay(readTurnState());
		if (!displayed) return { title: "", image: renderStateImage(IDLE_COLOR) };

		const { turn } = displayed;
		return {
			title: formatElapsed(elapsedOf(turn, Date.now())),
			image: renderStateImage(isInProgress(turn) ? WORKING_COLOR : IDLE_COLOR),
		};
	}
}
