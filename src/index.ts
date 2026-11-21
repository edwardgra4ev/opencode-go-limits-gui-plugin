import { Plugin } from "@opencode/plugin"
import { GoLimits } from "./rpc.js"
import { fetchLimits, resolveKey } from "./usage.js"

export default Plugin.define({
  id: "go-limits",
  async setup(ctx) {
    // No OpenCode Go key: do not register anything, so the GUI stays hidden.
    if (!resolveKey()) return

    const userAgent = `opencode/${ctx.app.version}`
    const registration = await ctx.rpc.register(GoLimits, {
      usage: async () => fetchLimits(userAgent),
    })
    return () => void registration.dispose()
  },
})
