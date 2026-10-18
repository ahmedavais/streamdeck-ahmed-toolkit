#!/usr/bin/env node
import { readHookInput } from "./hook-input.mjs";
import { SESSIONS_DIR, startTurn } from "./session-file.mjs";

const { session_id } = await readHookInput();
startTurn(SESSIONS_DIR, session_id, { startedAt: Date.now(), hostApp: process.env.__CFBundleIdentifier });
