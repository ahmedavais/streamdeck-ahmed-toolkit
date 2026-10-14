import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const SESSIONS_DIR = path.join(os.homedir(), ".streamdeck-ahmed-toolkit", "sessions");

export function startTurn(sessionsDir, sessionId, now) {
	writeSession(sessionsDir, sessionId, { turnStartedAt: now });
}

export function endTurn(sessionsDir, sessionId, now) {
	updateSession(sessionsDir, sessionId, (session) => ({ ...session, turnEndedAt: now }));
}

export function startWaiting(sessionsDir, sessionId, reason, now) {
	updateSession(sessionsDir, sessionId, (session) => ({ ...session, waiting: { for: reason, since: now } }));
}

export function endSession(sessionsDir, sessionId) {
	fs.rmSync(sessionFile(sessionsDir, sessionId), { force: true });
}

function updateSession(sessionsDir, sessionId, change) {
	const file = sessionFile(sessionsDir, sessionId);
	if (!fs.existsSync(file)) return;

	writeSession(sessionsDir, sessionId, change(readSession(file)));
}

function writeSession(sessionsDir, sessionId, session) {
	fs.mkdirSync(sessionsDir, { recursive: true });
	const draft = path.join(sessionsDir, `.${sessionId}.${process.pid}.draft`);
	fs.writeFileSync(draft, JSON.stringify(session));
	fs.renameSync(draft, sessionFile(sessionsDir, sessionId));
}

function readSession(file) {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sessionFile(sessionsDir, sessionId) {
	return path.join(sessionsDir, `${sessionId}.json`);
}
