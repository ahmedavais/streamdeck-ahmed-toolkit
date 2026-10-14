#!/usr/bin/env node
import { readHookInput } from "./hook-input.mjs";
import { waitingReasonFor } from "./notification.mjs";
import { SESSIONS_DIR, startWaiting } from "./session-file.mjs";

const { session_id, notification_type } = await readHookInput();
const reason = waitingReasonFor(notification_type);
if (reason) startWaiting(SESSIONS_DIR, session_id, reason, Date.now());
