#!/usr/bin/env node
import { readState, readStdin, writeState } from "./state-file.mjs";

const input = JSON.parse(await readStdin());
const state = readState();
state[input.session_id] = { turnStartedAt: Date.now() };
writeState(state);
