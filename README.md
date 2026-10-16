# Ahmed's Toolkit

Custom Stream Deck actions for macOS. The current set shows live Claude Code status on your keys.

## Actions

- Usage Gauge shows your weekly Claude Code rate-limit utilization as a percentage, colored green, yellow or red, with how long until the weekly window resets underneath, for example "↻ 5d 1h". It falls back to overage utilization when the weekly figure is missing, and then leaves the reset line off because the API sends no overage reset time. When a probe fails, it keeps the last percentage and draws it in grey until the next probe succeeds.
- Active Task shows how long your longest-running Claude Code turn has been going, on a blue key. When no turn is running, it shows how long your last turn took, on a grey key, and "Idle" when there is no live session at all. Press it to bring that session's app to the front, whether that's the Claude desktop app or a terminal. It brings the app forward, not a specific tab or window. It needs the Claude Code hooks below.
- MCP Status checks your MCP servers with `claude mcp list`. When all are connected it shows how many, for example "11 ok", on a green key. Otherwise it names the worst server and what's wrong with it, for example "Miro / auth", with "+2" when more servers are unhealthy. The key turns red when any failed and yellow otherwise. Failed outranks an unrecognized status, which outranks needing authentication, which outranks awaiting approval. Names lose their `claude.ai ` or `plugin:<name>:` prefix to fit the key, and the full list of unhealthy servers goes to the plugin log. A server that needs authentication is ignored until it has connected at least once, so connectors your organization enabled but you never use don't light the key. The plugin remembers connected servers in `~/.streamdeck-ahmed-toolkit/connected-servers.json`. Servers disabled for the project are ignored too. Ignored servers stay out of the plugin log as well. The log gets one line whenever the result changes, for example "MCP servers all connected: 13" or "MCP servers not connected: Slack (needs-authentication)", and the same line again once an hour, so a quiet log still shows the key is checking. A grey "?" means the check itself failed. Press the key to re-check now.

## Requirements

- macOS 10.15 or later and Stream Deck 7.1 or later
- Node.js 24 or later to build
- Claude Code installed and signed in

## Install

```sh
npm install
npm run build
npx streamdeck link com.ahmedavais.toolkit.sdPlugin
npx streamdeck dev
```

`npx streamdeck dev` turns on Stream Deck's developer mode, once per machine. Without it, Stream Deck ignores plugin restarts. Stream Deck picks up the linked plugin. You'll find the actions under "Ahmed's Toolkit" in the action list.

## Claude Code hooks

Active Task reads session state that three Claude Code hooks write to `~/.streamdeck-ahmed-toolkit/sessions/`, one file per session. Add them to `~/.claude/settings.json`, replacing `/path/to` with where you cloned this repo:

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

`turn-started` records when you submit a prompt and which app the session runs in (from macOS's `__CFBundleIdentifier`), `turn-ended` records when Claude stops, and `session-end` removes the session's file. The plugin shows only sessions whose Claude Code process is running, according to Claude Code's own registry in `~/.claude/sessions/`. That hides sessions that ended without `session-end` running, for example after a crash. The desktop app stops a session's process while the laptop sleeps and starts a new one when you reopen the session, so a waiting prompt recorded before the current process started is ignored, because that prompt died with the old process. The registry is an undocumented Claude Code file. If it's missing, the plugin shows every session as before.

Each session's hooks write only that session's file, replacing it in one rename, so concurrent sessions can't overwrite each other and the plugin never reads half a file.

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
npm run watch   # rebuild on change and restart the plugin in Stream Deck (requires developer mode)
```

Stream Deck keeps running the plugin process it already started, so after `npm run build` you need to restart the plugin:

```sh
npx streamdeck restart com.ahmedavais.toolkit
```

Without developer mode the CLI still prints "Restarted", but Stream Deck ignores the request and logs "Feature only enabled in developer mode" to `~/Library/Logs/ElgatoStreamDeck/StreamDeck.log`. To confirm a restart took effect, check that the plugin process has a new pid and start time:

```sh
ps -eo pid,lstart,command | grep "toolkit.sdPlugin/bin/plugin.js"
```

Code that talks to the outside world (HTTP, Keychain, timers, the Stream Deck logger) sits behind wrappers in `src/infrastructure/`. Each wrapper has `create()` for production and `createNull()` for tests, so tests run without network, Keychain or real timers.
