#!/usr/bin/env node
import { readHookInput } from "./hook-input.mjs";
import { SESSIONS_DIR, stopWaiting } from "./session-file.mjs";

const { session_id } = await readHookInput();
stopWaiting(SESSIONS_DIR, session_id);
