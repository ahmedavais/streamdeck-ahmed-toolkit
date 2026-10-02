export type Turn = { turnStartedAt: number; turnEndedAt?: number };

export type TurnStateFile = Record<string, Turn>;

export type DisplayedTurn = { sessionId: string; turn: Turn };

export function isInProgress(turn: Turn): boolean {
	return turn.turnEndedAt === undefined;
}

export function elapsedOf(turn: Turn, now: number): number {
	return (turn.turnEndedAt ?? now) - turn.turnStartedAt;
}

export function chooseTurnToDisplay(turns: TurnStateFile): DisplayedTurn | undefined {
	const entries = Object.entries(turns);
	if (entries.length === 0) return undefined;

	const inProgress = entries.filter(([, turn]) => isInProgress(turn));

	const [sessionId, turn] = inProgress.length > 0 ? longestRunning(inProgress) : lastFinished(entries);

	return { sessionId, turn };
}

type Entry = [string, Turn];

function longestRunning(entries: Entry[]): Entry {
	return entries.reduce((longest, entry) => (entry[1].turnStartedAt < longest[1].turnStartedAt ? entry : longest));
}

function lastFinished(entries: Entry[]): Entry {
	return entries.reduce((latest, entry) =>
		(entry[1].turnEndedAt ?? 0) > (latest[1].turnEndedAt ?? 0) ? entry : latest,
	);
}
