import { createSignal, Show } from "solid-js"
import { Command, Plugin, Slot, Style } from "@opencode/plugin/gui"
import { GoLimits, type Meter, type UsageLimits } from "./rpc.js"
import { definition } from "./gui/definition.js"
import { GoLimitsBar } from "./gui/meter.js"

const css = `
.gl-bar { display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 4px 12px; font-size: 11px;
  color: var(--v2-text-text-muted, rgba(127,127,127,.9)); font-variant-numeric: tabular-nums; }
.gl-brand { font-weight: 600; color: var(--v2-text-text-base, inherit); }
.gl-item { display: inline-flex; align-items: center; gap: 6px; }
.gl-name { color: var(--v2-text-text-base, inherit); }
.gl-ring { flex: none; color: var(--v2-text-text-muted, #8a8a8a); }
.gl-ring-bg, .gl-ring-fill { fill: none; stroke-width: 2.5; }
.gl-ring-bg { stroke: var(--v2-border-border-base, rgba(127,127,127,.35)); }
.gl-ring-fill { stroke: currentColor; stroke-linecap: round; transition: stroke-dasharray .3s ease; }
.gl-pct { min-width: 30px; text-align: right; }
.gl-reset { color: var(--v2-text-text-faint, rgba(127,127,127,.7)); }
.gl-warn .gl-ring { color: var(--v2-yellow-600, #d9a400); }
.gl-warn .gl-pct { color: var(--v2-yellow-600, #d9a400); }
.gl-danger .gl-ring { color: var(--v2-red-600, #e5484d); }
.gl-danger .gl-pct { color: var(--v2-red-600, #e5484d); }
.gl-state { color: var(--v2-text-text-faint, rgba(127,127,127,.7)); }
.gl-error { color: var(--v2-red-600, #e5484d); }
`

export default Plugin.define({
  ...definition,
  setup(ctx) {
    const [meters, setMeters] = createSignal<Meter[]>([])
    const [error, setError] = createSignal<string>()
    const [loaded, setLoaded] = createSignal(false)
    const [available, setAvailable] = createSignal(false)
    const [now, setNow] = createSignal(Date.now())

    const timer = setInterval(() => {
      setNow(Date.now())
      if (available()) void refresh()
    }, 60_000)

    const refresh = async () => {
      try {
        const result = (await ctx.client.rpc(GoLimits).usage({})) as UsageLimits
        setMeters(result.meters)
        setError(result.error)
        setAvailable(true)
      } catch (failure) {
        // RPC is absent when the plugin found no Go key: stop polling and render nothing.
        if (!available()) clearInterval(timer)
        setMeters([])
        setError(failure instanceof Error ? failure.message : String(failure))
      } finally {
        setLoaded(true)
      }
    }

    void refresh()

    ctx.add(Slot, {
      at: "window.bottom",
      render: () => (
        <Show when={available()}>
          <GoLimitsBar meters={meters} error={error} loaded={loaded} now={now} />
        </Show>
      ),
    })

    ctx.add(Style, css)

    ctx.add(Command, () =>
      available()
        ? {
            id: "refresh",
            title: ctx.t("command.refresh"),
            run: () => void refresh(),
          }
        : undefined,
    )

    return () => clearInterval(timer)
  },
})
