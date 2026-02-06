# FlyOn — Flight Search Engine

**Version:** 1.0.0
**Last Updated:** 2026-02-06

A responsive Flight Search Engine inspired by Google Flights, built with Next.js 15, TypeScript, and the Amadeus API.

## Quick Start

```bash
# Install dependencies
npm install

# Add your Amadeus API credentials to .env.local
# AMADEUS_API_KEY=your_key
# AMADEUS_API_SECRET=your_secret

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | CSS Modules |
| Charts | Recharts |
| API | Amadeus Self-Service API (test environment) |
| State | React Context + useReducer |

## Features

- Airport autocomplete search
- Flight search with flexible dates
- Real-time price graph visualization
- Advanced filtering (stops, price, airlines, times, duration)
- Cheapest-day price calendar
- Fully responsive design (mobile, tablet, desktop)
- Shareable URL state
- Skeleton loading states

## API Setup

1. Create a free account at [Amadeus for Developers](https://developers.amadeus.com/)
2. Create an app to get test API credentials
3. Copy `.env.local` and fill in your keys

## Recommended Test Routes

- JFK → LAX (domestic US)
- NYC → LON (transatlantic)
- MAD → BCN (European short-haul)
- CDG → FCO (European)

## Architecture

- **Server-side API proxy** — All Amadeus calls go through Next.js Route Handlers to protect API keys
- **Client-side filtering** — Flights fetched once, filtered/sorted instantly in the browser
- **URL state sync** — All search params + filters serialize to URL for shareability
- **CSS Modules** — Scoped styling with CSS custom properties for design tokens
