import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { Log } from "../../infrastructure/log";
import { SessionStarter } from "../start-session/session-starter";

type StartSessionSettings = { projectFolder?: string };

@action({ UUID: "com.ahmedavais.toolkit.claude.start-session" })
export class StartSession extends SingletonAction<StartSessionSettings> {
	private readonly log = Log.create();
	private readonly starter = SessionStarter.create();

	override async onKeyDown(ev: KeyDownEvent<StartSessionSettings>): Promise<void> {
		try {
			await this.starter.start(ev.payload.settings.projectFolder);
			await ev.action.showOk();
		} catch (failure) {
			this.log.error((failure as Error).message);
			await ev.action.showAlert();
		}
	}
}
