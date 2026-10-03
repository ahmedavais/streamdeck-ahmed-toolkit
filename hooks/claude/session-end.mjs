#!/usr/bin/env node
import { readHookInput } from "./hook-input.mjs";
import { endSession, SESSIONS_DIR } from "./session-file.mjs";

const { session_id } = await readHookInput();
endSession(SESSIONS_DIR, session_id);
