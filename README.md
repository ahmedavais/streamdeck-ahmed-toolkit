# Ahmed's Toolkit

Custom Stream Deck actions for macOS. The current set shows live Claude Code status on your keys.

## Actions

- Usage Gauge shows your weekly Claude Code rate-limit utilization as a percentage, colored green, yellow or red. It falls back to overage utilization when the weekly figure is missing. When a probe fails, it keeps the last percentage and draws it in grey until the next probe succeeds.
- Active Task shows how long your longest-running Claude Code turn has been going, on a blue key. When no turn is running, it shows how long your last turn took, on a grey key. It needs the Claude Code hooks below.
- MCP Status counts your MCP servers by health, for example "3 ok / 1 auth", based on `claude mcp list`. The key turns green when all are connected, red when any failed, and yellow otherwise. A grey "?" means the check itself failed. Press the key to re-check now.

## Requirements

- macOS 10.15 or later and Stream Deck 6.5 or later
- Node.js 20 or later to build
- Claude Code installed and signed in

## Install

```sh
npm install
npm run build
npx streamdeck link com.ahmedavais.toolkit.sdPlugin
```

Stream Deck picks up the linked plugin. You'll find the actions under "Ahmed's Toolkit" in the action list.

## Claude Code hooks

Active Task reads turn timings that three Claude Code hooks write to `~/.streamdeck-ahmed-toolkit/sessions/`, one file per session. Add them to `~/.claude/settings.json`, replacing `/path/to` with where you cloned this repo:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/turn-started.mjs\"" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/turn-ended.mjs\"" }] }
    ],
    "SessionEnd": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/session-end.mjs\"" }] }
    ]
  }
}
```

`turn-started` records when you submit a prompt, `turn-ended` records when Claude stops, and `session-end` removes the session's file. Each session's hooks write only that session's file, replacing it in one rename, so concurrent sessions can't overwrite each other and the plugin never reads half a file.

## How it works

```
Claude Code hooks ──writes──► ~/.streamdeck-ahmed-toolkit/sessions/<id>.json ◄──reads── Active Task

Usage Gauge ──► Keychain "Claude Code-credentials" ──► one-token Haiku request ──► rate-limit headers
MCP Status  ──► claude mcp list

Each action extends PollingKeyAction: one Poller per action checks on an interval,
skips a check while the previous one is running, and paints the result on every visible key.
```

The Usage Gauge reads the rate-limit headers from a real API request, so it sends one tiny Haiku request per minute. That request counts against the same limits it measures. The headers it reads are undocumented and may change.

MCP Status parses the human-readable output of `claude mcp list`, which has no machine-readable format. The plugin counts a status it doesn't recognize as "?" and colors the key yellow.

## Development

```sh
npm test        # run all tests
npm run watch   # rebuild on change and restart the plugin in Stream Deck
```

Code that talks to the outside world (HTTP, Keychain, timers, the Stream Deck logger) sits behind wrappers in `src/infrastructure/`. Each wrapper has `create()` for production and `createNull()` for tests, so tests run without network, Keychain or real timers.
