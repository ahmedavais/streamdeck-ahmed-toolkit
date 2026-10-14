import { formatElapsed } from "../../key-title/elapsed";
import type { Waiting } from "../sessions/session";

export function attentionTitle(waiting: Waiting, now: number): string {
	return `Approve\n${formatElapsed(now - waiting.since)}`;
}
