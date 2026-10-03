import fs from "node:fs";
import path from "node:path";

export function startTurn(sessionsDir, sessionId, now) {
	fs.mkdirSync(sessionsDir, { recursive: true });
	fs.writeFileSync(path.join(sessionsDir, `${sessionId}.json`), JSON.stringify({ turnStartedAt: now }));
}
