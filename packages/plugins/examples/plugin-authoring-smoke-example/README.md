# Plugin Authoring Smoke Example

A SiriusEcoSystem plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into SiriusEcoSystem

```bash
pnpm sirius-eco-system plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@sirius-eco-system/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
