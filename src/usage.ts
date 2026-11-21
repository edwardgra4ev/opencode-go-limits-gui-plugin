import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import type { Meter, UsageLimits } from "./rpc.js"

const ENDPOINT = "https://opencode.ai/inference/go/v1/usage"
const CACHE_MS = 60_000
const METERS = ["rolling", "weekly", "monthly"] as const

let cached: { at: number; value: UsageLimits } | undefined

/** The directory OpenCode itself uses for its data, by platform. */
export function dataDir(): string {
  if (process.env.XDG_DATA_HOME) return join(process.env.XDG_DATA_HOME, "opencode")
  const home = homedir()
  switch (process.platform) {
    case "darwin":
      return join(home, "Library", "Application Support", "opencode")
    case "win32":
      return join(process.env.APPDATA || join(home, "AppData", "Roaming"), "opencode")
    default:
      return join(home, ".local", "share", "opencode")
  }
}

export function authCandidates(): string[] {
  const explicit = process.env.OPENCODE_AUTH?.trim()
  if (explicit) return [explicit]
  return [join(dataDir(), "auth.json")]
}

export function resolveKey(): string | undefined {
  for (const path of authCandidates()) {
    if (!existsSync(path)) continue
    try {
      const auth = JSON.parse(readFileSync(path, "utf8")) as Record<string, { key?: unknown }>
      const key = auth["opencode-go"]?.key
      if (typeof key === "string" && key.trim()) return key.trim()
    } catch {
      // unreadable or malformed auth file: report no key below
    }
  }
  return undefined
}

function meter(id: string, raw: unknown): Meter | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const value = raw as { percent?: unknown; status?: unknown; resetsAt?: unknown }
  const percent = typeof value.percent === "number" ? Math.min(100, Math.max(0, value.percent)) : 0
  const resetsAt = typeof value.resetsAt === "string" ? Date.parse(value.resetsAt) : Number.NaN
  return {
    id,
    percent,
    limited: value.status !== undefined ? value.status !== "ok" || percent >= 100 : percent >= 100,
    resetsAt: Number.isFinite(resetsAt) ? resetsAt : 0,
  }
}

async function request(userAgent: string): Promise<UsageLimits> {
  const fetchedAt = Date.now()
  const key = resolveKey()
  if (!key) return { meters: [], fetchedAt, error: "no OpenCode Go key in auth.json" }

  try {
    const response = await fetch(ENDPOINT, {
      headers: { Authorization: `Bearer ${key}`, "User-Agent": userAgent, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return { meters: [], fetchedAt, error: `HTTP ${response.status}` }
    const body = (await response.json()) as { usage?: Record<string, unknown> }
    const meters = METERS.map((id) => meter(id, body.usage?.[id])).filter((item): item is Meter => item !== undefined)
    if (!meters.length) return { meters: [], fetchedAt, error: "unexpected usage response" }
    return { meters, fetchedAt }
  } catch (error) {
    return { meters: [], fetchedAt, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function fetchLimits(userAgent: string, force = false): Promise<UsageLimits> {
  if (!force && cached && Date.now() - cached.at < CACHE_MS) return cached.value
  const value = await request(userAgent)
  cached = { at: Date.now(), value }
  return value
}
