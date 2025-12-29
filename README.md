# What CSE AI Project

A Turborepo monorepo managed with pnpm.

## Project Structure

```
.
├── apps/          # Main application code
├── packages/      # Shared packages and libraries
├── turbo.json     # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0

### Installation

Install pnpm if you haven't already:

```bash
npm install -g pnpm@8.15.0
```

Install dependencies:

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

### Build

Build all apps and packages:

```bash
pnpm build
```

### Lint

Run linting across all packages:

```bash
pnpm lint
```

### Test

Run tests across all packages:

```bash
pnpm test
```

## Adding New Apps

To add a new app, create a new directory under `apps/` with its own `package.json`:

```bash
mkdir apps/my-app
cd apps/my-app
pnpm init
```

## Adding New Packages

To add a new shared package, create a new directory under `packages/` with its own `package.json`:

```bash
mkdir packages/my-package
cd packages/my-package
pnpm init
```

## Turborepo Features

- **Incremental builds**: Only rebuild what changed
- **Remote caching**: Share build cache across team
- **Parallel execution**: Run tasks across packages in parallel
- **Task pipelines**: Define dependencies between tasks
