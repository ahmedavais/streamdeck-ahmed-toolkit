import fs from "node:fs";
import path from "node:path";

export function startTurn(sessionsDir, sessionId, now) {
	writeTurn(sessionsDir, sessionId, { turnStartedAt: now });
}

export function endTurn(sessionsDir, sessionId, now) {
	const turn = JSON.parse(fs.readFileSync(sessionFile(sessionsDir, sessionId), "utf8"));
	writeTurn(sessionsDir, sessionId, { ...turn, turnEndedAt: now });
}

function writeTurn(sessionsDir, sessionId, turn) {
	fs.mkdirSync(sessionsDir, { recursive: true });
	fs.writeFileSync(sessionFile(sessionsDir, sessionId), JSON.stringify(turn));
}

function sessionFile(sessionsDir, sessionId) {
	return path.join(sessionsDir, `${sessionId}.json`);
}
