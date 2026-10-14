import type { Sessions, Waiting } from "../sessions/session";

export function mostUrgentWaiting(sessions: Sessions): Waiting | undefined {
	const waitings = Object.values(sessions)
		.map((session) => session.waiting)
		.filter((waiting): waiting is Waiting => waiting !== undefined);

	return waitings.find((waiting) => waiting.for === "permission") ?? waitings[0];
}
