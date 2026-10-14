import { formatElapsed } from "../../key-title/elapsed";
import type { Waiting } from "../sessions/session";

const ASK_FOR: Record<Waiting["for"], string> = { permission: "Approve", input: "Reply" };

export function attentionTitle(waiting: Waiting, now: number): string {
	return `${ASK_FOR[waiting.for]}\n${formatElapsed(now - waiting.since)}`;
}
