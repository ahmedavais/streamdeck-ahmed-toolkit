import fs from "node:fs";
import path from "node:path";

export function startTurn(sessionsDir, sessionId, now) {
	writeTurn(sessionsDir, sessionId, { turnStartedAt: now });
}

export function endTurn(sessionsDir, sessionId, now) {
	const file = sessionFile(sessionsDir, sessionId);
	if (!fs.existsSync(file)) return;

	const turn = JSON.parse(fs.readFileSync(file, "utf8"));
	writeTurn(sessionsDir, sessionId, { ...turn, turnEndedAt: now });
}

export function endSession(sessionsDir, sessionId) {
	fs.rmSync(sessionFile(sessionsDir, sessionId), { force: true });
}

function writeTurn(sessionsDir, sessionId, turn) {
	fs.mkdirSync(sessionsDir, { recursive: true });
	const draft = path.join(sessionsDir, `.${sessionId}.${process.pid}.draft`);
	fs.writeFileSync(draft, JSON.stringify(turn));
	fs.renameSync(draft, sessionFile(sessionsDir, sessionId));
}

function sessionFile(sessionsDir, sessionId) {
	return path.join(sessionsDir, `${sessionId}.json`);
}
