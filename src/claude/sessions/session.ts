export type Turn = { turnStartedAt: number; turnEndedAt?: number };

export type Session = Turn & { hostApp?: string };

export type Sessions = Record<string, Session>;
