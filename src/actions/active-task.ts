import { action, KeyAction, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { formatElapsed } from "../active-task/elapsed";
import { renderStateImage } from "../key-image/state-image";
import { chooseTurnToDisplay, elapsedOf, isInProgress } from "../active-task/turn-state";
import { readTurnState } from "../active-task/turn-store";

const TICK_INTERVAL_MS = 1_000;
const IDLE_COLOR = "#3a3a42";
const WORKING_COLOR = "#2f6fed";

@action({ UUID: "com.ahmedavais.toolkit.claude.active-task" })
export class ActiveTask extends SingletonAction {
	private timer: NodeJS.Timeout | undefined;

	override onWillAppear(ev: WillAppearEvent): void {
		if (!ev.action.isKey()) return;

		this.refresh(ev.action);

		if (!this.timer) {
			this.timer = setInterval(() => {
				for (const visibleAction of this.actions) {
					if (visibleAction.isKey()) this.refresh(visibleAction);
				}
			}, TICK_INTERVAL_MS);
		}
	}

	override onWillDisappear(_ev: WillDisappearEvent): void {
		if (this.actions.next().done) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	private refresh(action: KeyAction): void {
		const displayed = chooseTurnToDisplay(readTurnState());

		if (!displayed) {
			action.setTitle("");
			action.setImage(renderStateImage(IDLE_COLOR));
			return;
		}

		const { turn } = displayed;
		action.setTitle(formatElapsed(elapsedOf(turn, Date.now())));
		action.setImage(renderStateImage(isInProgress(turn) ? WORKING_COLOR : IDLE_COLOR));
	}
}
