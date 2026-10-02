#!/usr/bin/env node
import { readState, readStdin, writeState } from "./state-file.mjs";

const input = JSON.parse(await readStdin());
const state = readState();
const turn = state[input.session_id];
if (!turn) process.exit(0);

turn.turnEndedAt = Date.now();
writeState(state);
