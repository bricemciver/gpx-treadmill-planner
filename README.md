# GPX Treadmill Planner

## Description

A tool that transforms GPX route data into custom treadmill workout plans. Users upload GPX files containing
elevation and distance data, which the app processes to create tailored treadmill training sessions that
simulate real-world terrain.

## Features

- **GPX File Processing**: Parse elevation, distance, and other route data
- **Workout Generation**: Create bootcamp-style treadmill training plans
- **Terrain Simulation**: Match treadmill incline/speed to real-world gradients
- **Progressive Wizard Interface**: Step-by-step guidance through:
  1. GPX Upload
  2. Treadmill Configuration
  3. Fitness Level Input
  4. Workout Plan Generation
- **Responsive Design**: Adapts to mobile and desktop platforms
- **Modern Tech Stack**: Next.js 16, Radix UI, TypeScript, Tailwind CSS

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bricemciver/gpx-treadmill-planner.git
2. Install dependencies:
`pnpm install`

## Getting Started

1. Launch the development server:
`pnpm run dev`
2. Open http://localhost:3000 in your browser

## Accessing Different Components

- Wizard Interface Components:
  - /components/step-gpx-upload
  - /components/step-treadmill
  - /components/step-fitness
  - /components/step-plan-output
- Core UI components: /components/ui

## Codebase Structure

```
/app                    # Main Next.js pages
  └── page.tsx
/app/components         # UI components
/app/hooks              # Custom React hooks
/lib                    # Business logic
  ├── store.ts          # Wizard state management
  ├── gpx-utils.ts      # GPX data processing
  └── plan-generator.ts # Workout plan generator
/styles                 # Global CSS
next.config.mjs         # Next.js configuration
package.json            # Project metadata and dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions, issues, and feature requests are welcome! Please open an issue to get started.

## Running the Project

1. Start the development server:
pnpm run dev
2. Build for production:
pnpm run build
3. Run the production server:
pnpm run start

## 🧠 Workflow Overview

1. User uploads GPX file through wizard step 1
2. Treadmill configuration (speed, incline) set in step 2
3. Fitness level (weight, age, experience) input in step 3
4. Final plan is generated with mapped incline/intensity adjustments