# Ahmed's Toolkit

Custom Stream Deck actions for macOS. The current set shows live Claude Code status on your keys.

## Actions

- Usage Gauge shows your weekly Claude Code rate-limit utilization as a percentage, colored green, yellow or red, with how long until the weekly window resets underneath, for example "↻ 5d 1h". It falls back to overage utilization when the weekly figure is missing, and then leaves the reset line off because the API sends no overage reset time. When a probe fails, it keeps the last percentage and draws it in grey until the next probe succeeds.
- Active Task shows how long your longest-running Claude Code turn has been going, on a blue key. When no turn is running, it shows how long your last turn took, on a grey key, and "Idle" when there is no live session at all. Press it to bring that session's app to the front, whether that's the Claude desktop app or a terminal. It brings the app forward, not a specific tab or window. It needs the Claude Code hooks below.
- Needs Attention lights up when a Claude Code session is waiting on you. An orange key says "Approve" for a permission prompt, and a yellow key says "Reply" when a session has sat idle waiting for your next prompt. Below the word it shows how long it has been waiting. When nobody is waiting, the grey key says "All clear". With several sessions waiting, a permission prompt wins over a reply, then the longest wait. It needs the Claude Code hooks below.
- Start Session opens a new Claude Code session in the Claude desktop app, in the project folder you set in the key's settings. `~` works as your home folder. Add one key per project and give each a title. A new key is titled "New session" until you change it. A failed start shows a warning on the key and logs why.
- MCP Status checks your MCP servers with `claude mcp list`. When all are connected it shows how many, for example "11 ok", on a green key. Otherwise it names the worst server and what's wrong with it, for example "Miro / auth", with "+2" when more servers are unhealthy. The key turns red when any failed and yellow otherwise. Failed outranks an unrecognized status, which outranks needing authentication, which outranks awaiting approval. Names lose their `claude.ai ` or `plugin:<name>:` prefix to fit the key, and the full list of unhealthy servers goes to the plugin log. A server that needs authentication is ignored until it has connected at least once, so connectors your organization enabled but you never use don't light the key. The plugin remembers connected servers in `~/.streamdeck-ahmed-toolkit/connected-servers.json`. Servers disabled for the project are ignored too. A grey "?" means the check itself failed. Press the key to re-check now.

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

Active Task and Needs Attention read session state that five Claude Code hooks write to `~/.streamdeck-ahmed-toolkit/sessions/`, one file per session. Add them to `~/.claude/settings.json`, replacing `/path/to` with where you cloned this repo:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/turn-started.mjs\"" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/turn-ended.mjs\"" }] }
    ],
    "Notification": [
      { "matcher": "permission_prompt|idle_prompt", "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/notified.mjs\"" }] }
    ],
    "PostToolBatch": [
      { "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/tools-finished.mjs\"" }] }
    ],
    "SessionEnd": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node \"/path/to/streamdeck-ahmed-toolkit/hooks/claude/session-end.mjs\"" }] }
    ]
  }
}
```

`turn-started` records when you submit a prompt and which app the session runs in (from macOS's `__CFBundleIdentifier`), `turn-ended` records when Claude stops, and `session-end` removes the session's file. `notified` records that the session is waiting for your approval or reply. Claude Code has no hook for "you answered the permission prompt", so `tools-finished` clears the waiting once the approved tools have run. Each hook stamps the time it started, and a notification stamped before the tools finished is ignored, so the two hooks can't leave a session marked waiting if they finish out of order. Ending or starting a turn clears it too, which covers a denied prompt and a reply to an idle session. The plugin shows only sessions whose Claude Code process is running, according to Claude Code's own registry in `~/.claude/sessions/`. That hides sessions that ended without `session-end` running, for example after a crash. The desktop app stops a session's process while the laptop sleeps and starts a new one when you reopen the session, so a waiting prompt recorded before the current process started is ignored, because that prompt died with the old process. The registry is an undocumented Claude Code file. If it's missing, the plugin shows every session as before.

Each session's hooks write only that session's file, replacing it in one rename, so concurrent sessions can't overwrite each other and the plugin never reads half a file.

## Using the keys from an AI assistant

Stream Deck 7.4 and later can hand keys to AI assistants through Elgato's MCP server, so Claude Desktop can press them for you. Turn on MCP Deck under Preferences > General, put Start Session keys on the "MCP Actions" profile it creates, and describe each one, for example "start a Claude session in my toolkit repo". Then follow Elgato's [Stream Deck MCP setup](https://www.elgato.com/ww/en/explorer/products/stream-deck/sd-mcp-setup/) to connect Claude Desktop. The assistant can only press keys. It can't read what the status keys show.

## How it works

```
Claude Code hooks ──writes──► ~/.streamdeck-ahmed-toolkit/sessions/<id>.json ◄──reads── Active Task, Needs Attention

Usage Gauge ──► Keychain "Claude Code-credentials" ──► one-token Haiku request ──► rate-limit headers
MCP Status  ──► claude mcp list
Start Session ──► script (a pseudo-terminal) ──► claude --desktop, run in the project folder

Each action extends PollingKeyAction: one Poller per action checks on an interval,
skips a check while the previous one is running, and paints the result on every visible key.
```

The Usage Gauge reads the rate-limit headers from a real API request, so it sends one tiny Haiku request per minute. That request counts against the same limits it measures. The headers it reads are undocumented and may change.

Start Session wraps `claude --desktop` in macOS's `script` command because the CLI refuses to hand off to the desktop app without a terminal, and the plugin has none. This relies on undocumented CLI behavior, so a Claude Code update can break it. The key then shows a warning, and the log has what the CLI printed.

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
