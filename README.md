# OpenCode Go Limits for OpenCode Desktop

A bottom-strip plugin for OpenCode 2 Desktop that shows your OpenCode Go allowance at a glance:
the 5-hour, weekly and monthly meters as small circular rings, with percentages and reset
countdowns.

Русская версия: [README.ru.md](README.ru.md).

## Requirements

- OpenCode Desktop 2.3.x. The GUI plugin API is experimental and may change between releases.
- An OpenCode Go subscription with its API key connected to OpenCode (`/connect` → OpenCode Go).
- Node.js 20+ only if you build the plugin yourself; release archives ship the built
  `dist/gui-experimental.cjs`.

## Install from git (recommended)

```bash
git clone https://github.com/edwardgra4ev/opencode-go-limits-gui-plugin \
  ~/.config/opencode/plugins/go-limits
```

Add the plugin to `~/.config/opencode/opencode.json`:

```jsonc
{
  "plugins": ["./plugins/go-limits"],
}
```

Restart OpenCode Desktop once. The strip appears in the bottom-right corner of the window.

## Install from a release archive

1. Download `opencode-go-limits-gui-plugin-vX.Y.Z.zip` from
   [Releases](https://github.com/edwardgra4ev/opencode-go-limits-gui-plugin/releases).
2. Unzip it into `~/.config/opencode/plugins/go-limits`.
3. Add `"./plugins/go-limits"` to `plugins` in `~/.config/opencode/opencode.json`.
4. Restart Desktop.

## Install elsewhere

The plugin loads from any directory; point `plugins` at it directly, absolute or relative to the
config directory:

```jsonc
{
  "plugins": ["/mnt/hdd/Dev/opencode-go-limt"],
}
```

## What it shows

| Meter | Window |
| --- | --- |
| 5h | 20% of the monthly allowance, starts with first use, lasts five hours |
| Week | 50% of the monthly allowance, resets Monday 00:00 UTC |
| Month | the monthly allowance, resets with the paid period |

Ring colors:

| Usage | Color |
| --- | --- |
| `< 80%` | muted theme color |
| `80–99%` | yellow (`--v2-yellow-600`) |
| `≥ 100%` or a non-`ok` API status | red (`--v2-red-600`) |

The command palette has **Refresh OpenCode Go limits**; otherwise the plugin refreshes every
60 seconds and the server caches responses for 60 seconds.

## No key, no widget

The server part reads the `opencode-go` key from `auth.json` where OpenCode keeps it
(`$XDG_DATA_HOME/opencode/auth.json`, `~/.local/share/opencode/auth.json`,
`~/Library/Application Support/opencode/auth.json` or `%APPDATA%\opencode\auth.json`).

Without a key the plugin registers no RPC, and the window renders neither the strip nor the
refresh command. If the key is added later, reload plugins (or restart Desktop): the check runs
when the plugin loads.

Requests go only to `https://opencode.ai/inference/go/v1/usage`; the key never leaves your
machine for any other host.

## Build

```bash
npm install
npm run typecheck
npm run build      # writes dist/gui-experimental.cjs
npm run watch      # rebuild and hot-reload the GUI while you edit
```

`dist/` is committed: the release archive and the "dist is up to date" CI check both depend on it.

## Releases

CI (`.github/workflows/ci.yml`) runs typecheck, build and verifies `dist/` matches the source.
Release (`.github/workflows/release.yml`) runs on a `v*` tag, checks that the tag equals
`package.json`'s version, builds, packs a zip and publishes it with generated notes:

```bash
npm version patch --no-git-tag-version
git commit -am "Release v0.1.1"
git tag v0.1.1
git push origin main --tags
```
