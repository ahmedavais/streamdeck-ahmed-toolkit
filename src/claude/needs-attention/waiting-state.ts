import type { Sessions, Waiting } from "../sessions/session";

const URGENCY_OF: Record<Waiting["for"], number> = { permission: 0, input: 1 };

export function mostUrgentWaiting(sessions: Sessions): Waiting | undefined {
	return waitingsIn(sessions).sort(byUrgency)[0];
}

function waitingsIn(sessions: Sessions): Waiting[] {
	return Object.values(sessions)
		.map((session) => session.waiting)
		.filter((waiting): waiting is Waiting => waiting !== undefined);
}

function byUrgency(first: Waiting, second: Waiting): number {
	return URGENCY_OF[first.for] - URGENCY_OF[second.for] || first.since - second.since;
}
