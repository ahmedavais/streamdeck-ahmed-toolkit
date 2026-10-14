export type Turn = { turnStartedAt: number; turnEndedAt?: number };

export type Session = Turn;

export type Sessions = Record<string, Session>;
