# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions use
[SemVer](https://semver.org/).

## [0.1.0] - 2026-11-21

### Added

- Bottom window strip (`window.bottom`) with the OpenCode Go allowance:
  5-hour, weekly and monthly meters as circular rings, percentages and reset countdowns.
- Colors: muted below 80%, yellow from 80%, red at the limit or when the API reports a
  non-`ok` status.
- Server part reads the `opencode-go` key from OpenCode's `auth.json` and polls
  `https://opencode.ai/inference/go/v1/usage` with a 60-second cache.
- No key → the server part registers nothing and the GUI renders no strip or command.
- Command **Refresh OpenCode Go limits** in the command palette.
- English and Russian copy.
