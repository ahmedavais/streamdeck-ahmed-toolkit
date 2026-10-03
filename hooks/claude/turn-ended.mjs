#!/usr/bin/env node
import { readHookInput } from "./hook-input.mjs";
import { endTurn, SESSIONS_DIR } from "./session-file.mjs";

const { session_id } = await readHookInput();
endTurn(SESSIONS_DIR, session_id, Date.now());
