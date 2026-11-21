# opencode-go-limt

GUI-плагин OpenCode Desktop: лимиты OpenCode Go в полосе внизу окна (`window.bottom`).

## Состояние

Плагин реализован: серверная часть (`src/index.ts` + `src/usage.ts`) отдаёт лимиты по RPC, GUI рисует полосу в `window.bottom`. `dist/gui-experimental.cjs` собран. Регистрация — в `~/.config/opencode/opencode.json`.

## Команды

- `npm install` → `npm run typecheck` → `npm run build` (`dist/gui-experimental.cjs`).
- Проверка RPC на живом сервисе: `opencode2 api post /api/rpc/go-limits/usage -d '{"input":{}}'` (без обёртки `input` — `rpc.invalid_input`).
- Проверка источника напрямую: `npx tsx -e "import('./src/usage.ts').then(async m => console.log(await m.fetchLimits('opencode/2.3.2', true)))"`.
- `vite build --watch` перезагружает GUI в окнах; после первого добавления плагина может понадобиться перезапуск Desktop.
- Релиз: версия в `package.json` → коммит → тег `vX.Y.Z` → `git push origin main --tags`; GitHub Actions соберёт zip и опубликует Release. CI проверяет, что `dist/` закоммичен и совпадает со сборкой.

## Проверенные факты (не перепроверять)

- Лимиты Go: `GET https://opencode.ai/inference/go/v1/usage` с `Authorization: Bearer <opencode-go.key>`. Без `User-Agent` вернёт 403. Ответ: `usage.{rolling,weekly,monthly}.{percent,status,resetsAt}` (`resetsAt` — ISO-строка).
- Ключ: `$XDG_DATA_HOME/opencode/auth.json` (fallback `~/.local/share/opencode/auth.json`), поле `opencode-go.key`.
- Нет ключа → `src/index.ts` не регистрирует RPC, GUI не рисует слот и команду (availability сигнал в `src/gui.tsx`). Ключ, добавленный после старта, подхватится только после перезагрузки плагина.
- Внутренний `/api/experimental/usage/limits` здесь отдаёт `null` (нет логина в Console) — для виджета не годится.
- GUI-слоты Desktop 2.3.2: `window.bottom`, `session.header`, `session.location.menu`, `session.panel.end`. Слота «низ левого сайдбара» нет; ближайшее — `window.bottom` (полоса во всю ширину).

## Ориентиры

- Эталон GUI-плагина: `/mnt/hdd/Dev/linux/token-stats-gui-plugin` — `vite.config.ts` с `gui()`, `Rpc.define` на JSON Schema, `dataDir()`, Solid-компоненты.
- Сборка через `vite build` → `dist/gui-experimental.cjs`; GUI-энтри допускает только `.cjs`/`.js`, подключается через `exports["./gui-experimental"]`.
- Регистрация в `~/.config/opencode/opencode.json` (`plugins`); Desktop не читает `cli.json`. `vite build --watch` перезагружает GUI сам, первое добавление плагина требует перезапуска Desktop.
- GUI-API экспериментальный: id плагина не должен быть `opencode.*` и не конфликтовать с id встроенных плагинов.
