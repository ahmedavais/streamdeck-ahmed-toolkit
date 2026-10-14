export type Turn = { turnStartedAt: number; turnEndedAt?: number };

export type Waiting = { for: "permission" | "input"; since: number };

export type Session = Turn & { waiting?: Waiting };

export type Sessions = Record<string, Session>;
