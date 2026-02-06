# FlyOn — Flight Search Engine

**Version:** 1.8.1
**Last Updated:** 2026-02-06

A responsive Flight Search Engine inspired by Google Flights' utility, with an original design and UX. Built with Next.js 15, TypeScript, and the Amadeus Self-Service API.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/eranSoker/flyon.git
cd flyon

# Install dependencies
npm install

# Add your Amadeus API credentials
cp .env.local.example .env.local
# Edit .env.local with your keys:
# AMADEUS_API_KEY=your_test_api_key
# AMADEUS_API_SECRET=your_test_api_secret

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server-side API proxy, file-based routing, SSR/SSG support |
| Language | **TypeScript** (strict mode) | Type safety across API responses and component props |
| Styling | **CSS Modules** | Scoped styles, zero runtime cost, CSS custom properties for tokens |
| Charts | **Recharts** | Responsive, composable React chart library |
| API | **Amadeus Self-Service** | Industry-standard flight data with test environment |
| State | **React Context + useReducer** | Lightweight, no extra dependencies, sufficient for this scope |
| Date Utils | **date-fns** | Tree-shakeable, immutable date operations |

## Features

### Search
- Airport autocomplete with debounced API calls (300ms)
- Keyboard navigation in dropdown (arrow keys + Enter)
- Swap origin/destination
- Round trip / one way toggle
- Departure + return date pickers
- Passengers: adults, children, infants
- Cabin class: Economy, Premium Economy, Business, First

### Results
- Flight cards with price, times, duration, stops, airline
- Expandable details: segment-by-segment view with layovers
- "Cheapest" badge on the lowest-priced flight
- Sort by: Best (balanced score), Price, Duration, Departure time

### Filters (client-side, instant)
- Stops: Nonstop, 1 stop, 2+ stops with counts and cheapest price
- Price range: dual-thumb slider
- Airlines: multi-select checkboxes with select all/clear
- Departure/arrival time: range sliders with AM/PM labels
- Duration: max duration slider
- All filters update results and graph instantly — no API calls

### Price Graph
- Interactive Recharts bar chart
- Toggle views: By Airline, By Time of Day, By Stops
- Tooltips with price and flight count
- Animated transitions on view change

### Price Calendar
- Monthly calendar grid with cheapest price per departure date
- Color coding: green (cheap 20%), yellow (mid), red (expensive 20%)
- Click date to trigger new search
- Month navigation
- Progressive loading with per-cell shimmer placeholders

### Responsive Design
- Mobile: stacked layout, filter drawer (bottom sheet), compact cards
- Tablet: collapsible sidebar, filter button
- Desktop: sidebar filters + main content grid
- Touch-friendly targets (min 44px)
- Sticky search bar on scroll

### UX Polish
- Skeleton loading states for cards and graph
- Fade + slide animations on card load
- Empty state with helpful suggestions
- Error state with retry button
- Shareable URL state (all params serialized)

## Architecture Decisions

### Server-side API Proxy
All Amadeus API calls go through Next.js Route Handlers (`/api/airports`, `/api/flights`, `/api/price-analysis`). API keys never reach the client.

### Client-side Filtering
Flights are fetched once from the API and stored in React Context. All filtering, sorting, and chart data derivation happens client-side using `useMemo`. This means filter changes are instant — no network round-trips.

### URL State Sync
All search parameters are serialized to the URL query string. The results page is fully reconstructable from the URL alone, enabling shareable deep links.

### CSS Modules + Design Tokens
CSS custom properties define the entire design system (colors, typography, spacing, radii, shadows). Components use CSS Modules for scoped styling with zero JS runtime cost.

## API Setup

1. Create a free account at [Amadeus for Developers](https://developers.amadeus.com/)
2. Create a new app in the dashboard
3. Copy your test API Key and Secret
4. Add them to `.env.local`:

```env
AMADEUS_API_KEY=your_test_api_key
AMADEUS_API_SECRET=your_test_api_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

## Recommended Test Routes

The Amadeus test environment has limited data. These routes reliably return results:

- **JFK → LAX** — Domestic US, many results
- **NYC → LON** — Transatlantic, varied stops
- **MAD → BCN** — European short-haul
- **CDG → FCO** — European

## Known Limitations

- **Test API data** — Prices and availability are simulated, not real-time
- **Rate limits** — ~10 requests/second in test mode (handled with exponential backoff)
- **Price calendar** — Uses batch flight-offers requests as fallback, may be slow for full months
- **Limited route coverage** — Not all airport pairs return results in test mode
