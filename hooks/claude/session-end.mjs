#!/usr/bin/env node
import { readState, readStdin, writeState } from "./state-file.mjs";

const input = JSON.parse(await readStdin());
const state = readState();
delete state[input.session_id];
writeState(state);
