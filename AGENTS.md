# Development Guide for AI Agents

## Common Commands

- Development: `pnpm run dev` - Starts Next.js development server with hot reloading
- Build: `pnpm run build` - Compiles production-ready bundle with tree-shaking
- Start: `pnpm run start` - Runs production server (requires pre-built assets)
- Lint: `pnpm run lint` - Runs static analysis with oxlint rules
- Format: `pnpm run format` - Automatically formats code with oxfmt

## Code Architecture

### Project Structure

- app/ - Next.js pages and layout system (layout.tsx)
- components/ - UI building blocks structured by feature area
- hooks/ - Custom React hooks (use-mobile.ts, use-toast.ts)
- lib/ - Core logic (store.ts, gpx-utils.ts, plan-generator.ts)
- next.config.mjs - Next.js configuration with Tailwind support
- styles/ - Global CSS definitions including Tailwind base styles

### Key Components

- Wizard interface with 4 sequential steps:
  1. GPX Upload (step-gpx-upload.tsx)
  2. Treadmill Configuration (step-treadmill.tsx)
  3. Fitness Input (step-fitness.tsx)
  4. Plan Output (step-plan-output.tsx)
- Shared UI components under components/ui/ (buttons, inputs, cards)
- Radix UI primitives form the base component library

### State Management

- lib/store.ts manages wizard state via React context store
- Centralized state includes current step tracking and reset capability
- Store persists state only for the duration of the wizard session

### Styling & Dependencies

- Tailwind CSS v4.2.4 for utility-first styling
- Radix UI v2.x for accessible, unstyled components
- Next.js 16.2.4 as the foundation framework
- TypeScript 5.9.3 for static typing support

## Development Workflow

1. Initial development uses `pnpm run dev` for local testing
2. Code changes primarily target:
    - Functional components in components/
    - Wizard state logic in lib/store.ts
    - Domain-specific logic in lib/gpx-utils.ts and lib/plan-generator.ts
3. Code quality maintained through:
    - Pre-commit formatting with `pnpm run format`
    - Linting checks via `pnpm run lint`
4. Deployment pipeline expects pre-built assets in next.config.mjs configuration

The application represents a progressive web app that transforms GPX route data into structured treadmill       
training plans through a guided wizard interface, maintaining state consistency across four distinct interaction
 phases.