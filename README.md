# Space 3D

> A cinematic 3D cyber-space interface with an animated boot sequence, a module index, and dedicated module views.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?logo=three.js&logoColor=white)](https://threejs.org/)

## Live Demo

🚀 [Open the production deployment](https://space3d-3suxaqu9b-ravels-projects-13eaae80.vercel.app)

## Overview

Space 3D presents a futuristic “cyberspace” shell rather than a conventional dashboard.

The experience has two main layers:

1. **Cyberspace index** — the main module directory.
2. **Module viewer** — a focused view for an individual module.

The application can optionally start with a splash / boot sequence before revealing the main interface.

## Navigation

The application exposes a small route system:

\`\`\`text
/
└── Cyberspace

/module/:id
└── ModuleViewer
\`\`\`

Unknown routes are redirected back to the main cyberspace screen.

## Interaction Model

### Splash / Boot Sequence

A dedicated splash screen can play once at startup and then hand control to the application shell.

The boot behavior is controlled by application initialization state rather than being replayed on every internal navigation.

### Module Index

The main cyberspace page is responsible for presenting the available modules and acting as the navigation hub.

### Module Viewer

Each module can open in its own viewer route, giving the project a clean separation between discovery and inspection.

## Animation

The interface uses Framer Motion for:

- splash transitions
- route-level transitions
- animated presence
- reduced-motion aware behavior

The app explicitly opts into \`reducedMotion="user"\` so animations respect the user's accessibility preference.

## Tech Stack

- React
- TypeScript
- Vite
- Three.js
- React Router
- Framer Motion
- Tailwind CSS
- Lucide React

## Architecture

The application keeps the scene shell and navigation separate from the module content:

\`\`\`text
App
├── BrowserRouter
├── MotionConfig
├── Routes
│   ├── Cyberspace
│   └── ModuleViewer
└── SplashScreen
\`\`\`

This keeps the startup sequence independent from route rendering and allows the module interface to evolve without changing the global shell.

## Getting Started

### Requirements

- Node.js 18+
- npm

### Install

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Preview

\`\`\`bash
npm run preview
\`\`\`

### Lint

\`\`\`bash
npm run lint
\`\`\`

## Deployment Notes

The repository includes a SPA fallback configuration for Vercel so React Router paths can resolve correctly when opened directly.

## Project Structure

\`\`\`text
src/
├── components/
│   └── cyber/
│       └── SplashScreen
├── pages/
│   ├── Cyberspace
│   └── ModuleViewer
├── hooks
├── data
└── App.tsx
\`\`\`

## Project Scope

Space 3D is primarily a **front-end experience and interaction prototype**.

It focuses on the visual language, route model, animation behavior, and 3D presentation of a fictional cyberspace environment. It is not currently a full backend-driven cyber platform.

## License

No explicit open-source license is currently defined in the repository.

---

A small experiment in treating a web application like a place you boot into rather than a page you open.