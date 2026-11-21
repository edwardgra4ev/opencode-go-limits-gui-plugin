import { Plugin } from "@opencode/plugin/gui"

export const en = {
  "meter.rolling": "5h",
  "meter.weekly": "Week",
  "meter.monthly": "Month",
  "reset": "resets in {{time}}",
  "state.loading": "Go limits…",
  "state.error": "Go limits: {{message}}",
  "command.refresh": "Refresh OpenCode Go limits",
}

export const ru = {
  "meter.rolling": "5 ч",
  "meter.weekly": "Неделя",
  "meter.monthly": "Месяц",
  "reset": "сброс через {{time}}",
  "state.loading": "Лимиты Go…",
  "state.error": "Лимиты Go: {{message}}",
  "command.refresh": "Обновить лимиты OpenCode Go",
}

export const definition = Plugin.define({
  i18n: { en, ru },
})
