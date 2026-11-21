import { Rpc } from "@opencode/plugin/rpc"

const meter = {
  type: "object",
  properties: {
    id: { type: "string" },
    percent: { type: "number" },
    limited: { type: "boolean" },
    resetsAt: { type: "number" },
  },
  required: ["id", "percent", "limited", "resetsAt"],
  additionalProperties: false,
} as const

export const GoLimits = Rpc.define({
  id: "go-limits",
  methods: {
    usage: {
      input: { type: "object", properties: {}, additionalProperties: false },
      output: {
        type: "object",
        properties: {
          meters: { type: "array", items: meter },
          fetchedAt: { type: "number" },
          error: { type: "string" },
        },
        required: ["meters", "fetchedAt"],
        additionalProperties: false,
      },
    },
  },
  events: {},
})

export type Meter = {
  id: string
  percent: number
  limited: boolean
  resetsAt: number
}

export type UsageLimits = {
  meters: Meter[]
  fetchedAt: number
  error?: string
}
