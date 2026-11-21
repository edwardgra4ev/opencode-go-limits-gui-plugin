import { For, Show, type Accessor } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { Meter } from "../rpc.js"
import type { definition } from "./definition"

export interface GoLimitsProps {
  readonly meters: Accessor<Meter[]>
  readonly error: Accessor<string | undefined>
  readonly loaded: Accessor<boolean>
  readonly now: Accessor<number>
}

function duration(until: number, now: number): string {
  const left = until - now
  if (!Number.isFinite(left) || left <= 0) return "0m"
  const minutes = Math.floor(left / 60_000)
  const days = Math.floor(minutes / 1440)
  if (days > 0) return `${days}d ${Math.floor((minutes % 1440) / 60)}h`
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export function GoLimitsBar(props: GoLimitsProps) {
  const ctx = usePlugin<typeof definition>()

  const tone = (meter: Meter) => (meter.limited || meter.percent >= 100 ? "gl-danger" : meter.percent >= 80 ? "gl-warn" : "")

  return (
    <div class="gl-bar" role="status" aria-live="polite">
      <span class="gl-brand">Go</span>
      <Show
        when={props.meters().length}
        fallback={
          <span class={props.error() ? "gl-state gl-error" : "gl-state"} title={props.error()}>
            {props.loaded() ? ctx.t("state.error", { message: props.error() ?? "—" }) : ctx.t("state.loading")}
          </span>
        }
      >
        <For each={props.meters()}>
          {(meter) => {
            const radius = 7
            const circumference = 2 * Math.PI * radius
            return (
              <span class={`gl-item ${tone(meter)}`} title={`${meter.percent}% · ${ctx.t("reset", { time: duration(meter.resetsAt, props.now()) })}`}>
                <svg class="gl-ring" viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
                  <circle class="gl-ring-bg" cx="9" cy="9" r={radius} />
                  <circle
                    class="gl-ring-fill"
                    cx="9"
                    cy="9"
                    r={radius}
                    stroke-dasharray={`${(circumference * meter.percent) / 100} ${circumference}`}
                    transform="rotate(-90 9 9)"
                  />
                </svg>
                <span class="gl-name">{ctx.t(`meter.${meter.id}`)}</span>
                <span class="gl-pct">{Math.round(meter.percent)}%</span>
                <span class="gl-reset">{ctx.t("reset", { time: duration(meter.resetsAt, props.now()) })}</span>
              </span>
            )
          }}
        </For>
      </Show>
    </div>
  )
}
