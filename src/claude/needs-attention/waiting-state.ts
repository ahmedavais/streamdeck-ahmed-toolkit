import type { Sessions, Waiting } from "../sessions/session";

export function mostUrgentWaiting(sessions: Sessions): Waiting | undefined {
	return Object.values(sessions).find((session) => session.waiting)?.waiting;
}
