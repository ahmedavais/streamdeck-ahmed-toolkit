# Ahmed's Toolkit

A Stream Deck plugin for macOS whose keys show live Claude Code status: usage, the active turn and MCP servers.
`README.md` explains each action, the Claude Code hooks it needs and how it works; read it before changing behavior.

## Checks

- CI (`.github/workflows/ci.yml`) runs on every pull request and push to main, on macOS: `npx tsc --noEmit`, `npm run
  lint`, `npm test`, `npm run build` and `npx streamdeck validate com.ahmedavais.toolkit.sdPlugin`. Run them before
  calling any change done.
- Lint: ESLint with type-aware TypeScript rules (`eslint.config.js`). Lint only, no formatter. The structural limits
  come from [karkhana](https://github.com/ahmedavais/karkhana)'s `karkhana/eslint-limits`: more than 3 parameters,
  complexity over 10 and nesting deeper than 4 are errors, a function over 30 lines is a warning. `package-lock.json`
  pins the karkhana commit; `npm update karkhana` takes a newer one. node:test's `test` and `describe` may float;
  `require-await` is off because `async` without `await` is deliberate here: it keeps an async interface, and a stand-in
  that throws must reject the way the real call does.
- Duplication: the `duplication` job in `.github/workflows/ci.yml`, shared from
  [karkhana](https://github.com/ahmedavais/karkhana), fails when a change adds code duplicated elsewhere in the repo,
  tests included. `.jscpd.json` skips `package-lock.json`.
- Adversarial review: `.github/workflows/adversarial-review.yml` has Claude Code review every pull request with the
  shared workflow and brief from [karkhana](https://github.com/ahmedavais/karkhana). Comments only. The reviewer takes
  this repo's checks and conventions from this file, so keep them current here.

## Conventions

- Code that talks to the outside world (HTTP, Keychain, timers, commands, the Stream Deck logger) sits behind
  wrappers in `src/infrastructure/` with `create()` and `createNull()`. Tests are sociable and state-based, with no
  mocking libraries, and never touch the network, Keychain or real timers.
- Each action extends `PollingKeyAction`; logic lives in modules under `src/claude/`, with a `*.test.ts` next to
  each, and `src/claude/actions/` only wires it to keys.
- The hooks in `hooks/claude/` run inside every Claude Code session on this machine. A hook writes only its own
  session's file, replacing it in one rename, so concurrent sessions can't overwrite each other.
- The plugin reads undocumented Claude Code files, headers and command output. A format it doesn't recognize shows
  as "?" or grey on the key, never as a crash.
- No comments in code. Names and small functions carry the meaning.
- `playground/` is for throwaway exploration and stays out of git.
