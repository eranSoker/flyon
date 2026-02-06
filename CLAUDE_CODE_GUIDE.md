# Flight Search Engine — Claude Code Implementation Guide

## Overview

Build a responsive **Flight Search Engine** inspired by Google Flights' utility, but with original design and UX improvements. This is a take-home assignment with a 16-hour budget, so prioritize working software with polish over perfection.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14+ (App Router)** |
| Language | **TypeScript** (strict mode) |
| Styling | **CSS Modules** (`.module.css` per component) |
| Charts | **Recharts** |
| API | **Amadeus Self-Service API** (test environment) |
| State Management | **React Context + useReducer** for search/filter state |
| HTTP | **Native fetch** via Next.js Route Handlers (server-side API proxy) |

---

## Project Structure

```
flight-search/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with fonts, metadata
│   │   ├── page.tsx                    # Home / search page
│   │   ├── results/
│   │   │   └── page.tsx                # Search results page (reads URL params)
│   │   ├── api/
│   │   │   ├── flights/
│   │   │   │   └── route.ts            # Proxy: Amadeus Flight Offers Search
│   │   │   ├── airports/
│   │   │   │   └── route.ts            # Proxy: Amadeus Airport Autocomplete
│   │   │   └── price-analysis/
│   │   │       └── route.ts            # Proxy: Amadeus Flight Price Analysis / date grid
│   │   └── globals.css                 # CSS variables, resets, typography
│   │
│   ├── components/
│   │   ├── SearchForm/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── SearchForm.module.css
│   │   │   ├── AirportInput.tsx        # Autocomplete airport selector
│   │   │   ├── AirportInput.module.css
│   │   │   ├── DatePicker.tsx          # Date selector with calendar
│   │   │   ├── DatePicker.module.css
│   │   │   ├── PassengerSelector.tsx   # Traveler count dropdown
│   │   │   └── PassengerSelector.module.css
│   │   │
│   │   ├── Results/
│   │   │   ├── FlightCard.tsx          # Individual flight result card
│   │   │   ├── FlightCard.module.css
│   │   │   ├── FlightList.tsx          # Scrollable results list
│   │   │   ├── FlightList.module.css
│   │   │   ├── FlightDetails.tsx       # Expanded view with segments/layovers
│   │   │   └── FlightDetails.module.css
│   │   │
│   │   ├── Filters/
│   │   │   ├── FilterPanel.tsx         # Container for all filters
│   │   │   ├── FilterPanel.module.css
│   │   │   ├── StopsFilter.tsx         # Non-stop / 1 stop / 2+ stops
│   │   │   ├── PriceRangeFilter.tsx    # Min-max price slider
│   │   │   ├── AirlineFilter.tsx       # Multi-select airline checkboxes
│   │   │   ├── TimeFilter.tsx          # Departure/arrival time ranges
│   │   │   └── DurationFilter.tsx      # Max flight duration slider
│   │   │
│   │   ├── PriceGraph/
│   │   │   ├── PriceGraph.tsx          # Recharts line/bar chart
│   │   │   └── PriceGraph.module.css
│   │   │
│   │   ├── PriceCalendar/
│   │   │   ├── PriceCalendar.tsx       # Cheapest-day calendar grid
│   │   │   └── PriceCalendar.module.css
│   │   │
│   │   ├── Skeleton/
│   │   │   ├── SkeletonCard.tsx        # Loading placeholder for flight cards
│   │   │   ├── SkeletonGraph.tsx       # Loading placeholder for price graph
│   │   │   └── Skeleton.module.css
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Chip.tsx               # Filter tag/chip component
│   │       ├── Slider.tsx             # Range slider
│   │       ├── Checkbox.tsx
│   │       ├── Modal.tsx              # Mobile filter drawer
│   │       └── ui.module.css
│   │
│   ├── context/
│   │   └── SearchContext.tsx           # Global search + filter state
│   │
│   ├── hooks/
│   │   ├── useFlightSearch.ts         # Fetch + cache flight results
│   │   ├── useAirportSearch.ts        # Debounced airport autocomplete
│   │   ├── usePriceAnalysis.ts        # Fetch price calendar data
│   │   ├── useFilters.ts              # Filter logic + derived filtered results
│   │   └── useURLState.ts            # Sync search params ↔ URL
│   │
│   ├── lib/
│   │   ├── amadeus.ts                 # Amadeus API client (server-side only)
│   │   ├── formatters.ts             # Duration, price, date formatters
│   │   ├── constants.ts              # Airline names, IATA codes, etc.
│   │   └── types.ts                  # All TypeScript interfaces
│   │
│   └── styles/
│       └── variables.css              # CSS custom properties (design tokens)
│
├── public/
│   └── icons/                         # Airline logos or SVG icons (if needed)
│
├── .env.local                         # AMADEUS_API_KEY, AMADEUS_API_SECRET
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Phase 1: Project Scaffolding & API Setup

### Step 1.1 — Initialize the Project

```bash
npx create-next-app@latest flight-search --typescript --app --src-dir
cd flight-search
npm install recharts date-fns
```

### Step 1.2 — Environment Variables

Create `.env.local`:

```env
AMADEUS_API_KEY=your_test_api_key
AMADEUS_API_SECRET=your_test_api_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com
```

### Step 1.3 — Amadeus Auth Client (`src/lib/amadeus.ts`)

Build a server-side singleton that manages OAuth2 token refresh:

```typescript
// Key behaviors:
// - Fetches token from POST /v1/security/oauth2/token
// - Caches token in memory with expiry tracking
// - Auto-refreshes when expired
// - All API calls go through this client

class AmadeusClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  async getToken(): Promise<string> { /* ... */ }

  async get(endpoint: string, params: Record<string, string>): Promise<any> {
    const token = await this.getToken();
    const url = new URL(`${process.env.AMADEUS_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Amadeus API error: ${res.status}`);
    return res.json();
  }
}

export const amadeus = new AmadeusClient();
```

### Step 1.4 — API Route Handlers

Create three proxy routes under `src/app/api/`:

**`/api/airports`** — Airport autocomplete
- Amadeus endpoint: `GET /v1/reference-data/locations`
- Params: `subType=AIRPORT,CITY`, `keyword={query}`
- Return: `{ iataCode, name, cityName, countryCode }[]`

**`/api/flights`** — Flight offers search
- Amadeus endpoint: `GET /v2/shopping/flight-offers`
- Params: `originLocationCode`, `destinationLocationCode`, `departureDate`, `returnDate?`, `adults`, `nonStop?`, `max=50`
- Return the full Amadeus response (includes dictionaries for carrier names)

**`/api/price-analysis`** — Price trends for calendar
- Amadeus endpoint: `GET /v1/analytics/itinerary-price-metrics`
- Params: `originIataCode`, `destinationIataCode`, `departureDate`
- Fallback: If this endpoint is limited in test env, generate calendar data by making multiple flight-offers calls for surrounding dates (±15 days) and extracting min prices

> **Important:** All Amadeus calls MUST happen server-side in route handlers. Never expose API keys to the client.

---

## Phase 2: Core Search Experience

### Step 2.1 — Design Tokens (`src/styles/variables.css`)

Define a cohesive design system via CSS custom properties:

```css
:root {
  /* Colors — use a modern, clean palette. NOT a Google Flights clone. */
  --color-primary: #1a56db;         /* Main action color */
  --color-primary-light: #e8effc;
  --color-secondary: #0e9f6e;       /* Success / cheapest indicator */
  --color-surface: #ffffff;
  --color-background: #f5f7fa;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-error: #e02424;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;

  /* Breakpoints (for reference — use in media queries) */
  /* --bp-sm: 640px; --bp-md: 768px; --bp-lg: 1024px; --bp-xl: 1280px; */
}
```

### Step 2.2 — SearchForm Component

**Location:** Homepage (`src/app/page.tsx`) — centered hero-style layout.

**Sub-components:**

1. **AirportInput** (×2: origin + destination)
   - Text input with debounced API calls (300ms) to `/api/airports`
   - Dropdown showing matching airports: `City Name (IATA)` + country flag
   - Keyboard navigation (arrow keys + Enter)
   - Swap button between origin ↔ destination
   - Store selected airport as `{ iataCode, name, cityName }`

2. **DatePicker**
   - Two date inputs: Departure + Return (optional for one-way)
   - Toggle between "Round trip" and "One way"
   - Use `date-fns` for date logic
   - Min date = today, sensible max date = +1 year
   - Display format: "Mon, Jan 15"

3. **PassengerSelector**
   - Dropdown: Adults (1-9), Children (0-8), Infants (0-4)
   - Compact display: "2 Travelers"

4. **Cabin class selector**
   - Dropdown: Economy, Premium Economy, Business, First

5. **Search button**
   - On click: navigate to `/results?origin=JFK&destination=LAX&departureDate=2025-03-15&returnDate=2025-03-22&adults=1&cabinClass=ECONOMY`
   - All search params serialized to URL

### Step 2.3 — URL State Sync (`useURLState` hook)

This is critical for the **shareable URL** requirement:

```typescript
// Reads search params from URL on page load
// Writes search params to URL when search is submitted
// Results page initializes state from URL params on mount
// Use next/navigation: useSearchParams() + useRouter()

// The results page should be fully reconstructable from URL alone:
// /results?origin=JFK&destination=LAX&departureDate=2025-03-15&adults=1
```

---

## Phase 3: Results Page & Flight List

### Step 3.1 — Results Page Layout

**Desktop (≥1024px):**
```
┌─────────────────────────────────────────────────────┐
│  [Compact Search Bar — editable, same fields]       │
├──────────┬──────────────────────────────────────────┤
│          │  [Price Graph — full width]               │
│  Filter  ├──────────────────────────────────────────┤
│  Panel   │  Showing X of Y flights · Sort: ▾        │
│  (Left   ├──────────────────────────────────────────┤
│  Sidebar)│  [Flight Card]                            │
│          │  [Flight Card]                            │
│          │  [Flight Card]                            │
│          │  [Flight Card]                            │
│          │  ...                                      │
└──────────┴──────────────────────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────┐
│ [Compact Search Bar]    │
├─────────────────────────┤
│ [Filter Chips — horiz.] │ ← tapping opens full filter drawer (Modal)
├─────────────────────────┤
│ [Price Graph — compact] │
├─────────────────────────┤
│ Showing X results       │
├─────────────────────────┤
│ [Flight Card]           │
│ [Flight Card]           │
│ [Flight Card]           │
└─────────────────────────┘
```

### Step 3.2 — FlightCard Component

Each card displays:

```
┌──────────────────────────────────────────────────────┐
│  $342          ←── Price (prominent)                  │
│                                                      │
│  AA 1234       JFK → LAX       6h 15m    Non-stop   │
│  09:30 AM ─────────────────── 12:45 PM              │
│  American Airlines                                   │
│                                                      │
│  [If round trip: return flight below in same card]   │
│                                                      │
│  ▾ View details                                      │
└──────────────────────────────────────────────────────┘
```

**Design notes:**
- Use a clean card with `var(--shadow-sm)` and `var(--radius-md)`
- Highlight cheapest flight with a subtle green badge/border
- Expandable details section showing: layover info, baggage, booking class
- Animate expand/collapse with CSS transitions

### Step 3.3 — FlightDetails (Expanded View)

When "View details" is clicked, expand the card to show:
- Each flight segment with departure/arrival airports + times
- Layover durations between segments
- Aircraft type (if available in API response)
- Baggage allowance (if available)
- Fare class

### Step 3.4 — Sorting

Provide a sort dropdown above results:
- **Best** (default) — a balanced score of price + duration + stops
- **Price** (low to high)
- **Duration** (shortest first)
- **Departure time** (earliest first)

---

## Phase 4: Live Price Graph

### Step 4.1 — PriceGraph Component

Use **Recharts** to build a responsive bar or area chart.

**X-axis:** Price buckets or airlines (depending on view mode)
**Y-axis:** Price in USD
**Data source:** Derived from the current flight results (not a separate API call)

```typescript
// Derive chart data from filtered flights:
interface PriceDataPoint {
  label: string;       // e.g., airline name, time bucket, or stop count
  minPrice: number;
  avgPrice: number;
  count: number;
}
```

**Key requirement — LIVE updates:**
The graph MUST re-render instantly when filters change. This means:

1. Flight results are fetched once and stored in state
2. Filters are applied client-side to produce `filteredFlights`
3. Chart data is derived from `filteredFlights` using `useMemo`
4. When any filter changes → `filteredFlights` updates → chart re-derives → re-renders

**Chart features:**
- Tooltip on hover showing price + flight count
- Animated transitions when data changes (Recharts `isAnimationActive`)
- Responsive container using `<ResponsiveContainer>`
- Toggle between views: "By Airline", "By Time of Day", "By Stops"

### Step 4.2 — Chart-Filter Interaction

Make the chart interactive:
- Clicking a bar/segment in the chart applies that as a filter
- Visual highlight on the chart for currently active filters
- Clear filter by clicking again

---

## Phase 5: Complex Filtering

### Step 5.1 — Filter Architecture

```typescript
// src/context/SearchContext.tsx

interface FilterState {
  stops: number[];              // e.g., [0, 1] = non-stop and 1 stop
  priceRange: [number, number]; // e.g., [0, 1500]
  airlines: string[];           // e.g., ["AA", "DL", "UA"]
  departureTimeRange: [number, number]; // hours: [6, 18]
  arrivalTimeRange: [number, number];
  maxDuration: number;          // minutes
}

// All filters applied simultaneously via a single filter function:
function applyFilters(flights: Flight[], filters: FilterState): Flight[] {
  return flights.filter(flight => {
    const matchesStops = filters.stops.length === 0 || filters.stops.includes(flight.stops);
    const matchesPrice = flight.price >= filters.priceRange[0] && flight.price <= filters.priceRange[1];
    const matchesAirline = filters.airlines.length === 0 || filters.airlines.includes(flight.airline);
    const matchesDeparture = /* ... */;
    const matchesDuration = /* ... */;
    return matchesStops && matchesPrice && matchesAirline && matchesDeparture && matchesDuration;
  });
}
```

### Step 5.2 — Filter Components

**StopsFilter:**
- Checkboxes: "Non-stop", "1 stop", "2+ stops"
- Show count + cheapest price next to each option: "Non-stop (12) from $342"

**PriceRangeFilter:**
- Dual-thumb range slider
- Min/max labels update as slider moves
- Histogram overlay showing price distribution

**AirlineFilter:**
- Checkboxes for each airline present in results
- "Select all" / "Clear" buttons
- Show cheapest price per airline

**TimeFilter:**
- Departure time range slider (24h)
- Visual time blocks: "Morning", "Afternoon", "Evening", "Night"

**DurationFilter:**
- Single-thumb slider for max duration
- Display as "Up to Xh Ym"

### Step 5.3 — Filter UX Details

- Every filter change triggers instant re-render of both flight list AND price graph
- Show active filter count on mobile filter button: "Filters (3)"
- "Clear all filters" button
- When filter results in 0 flights, show empty state with suggestion to relax filters
- Animate flight list changes (items fading in/out)

---

## Phase 6: Cheapest-Day Calendar

### Step 6.1 — PriceCalendar Component

A monthly calendar grid showing the cheapest price for each departure date.

```
┌──────────────────────────────────────────┐
│  ◀  March 2025  ▶                        │
├──────────────────────────────────────────┤
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun       │
│                          1     2         │
│                         $342  $298       │
│  3     4     5     6     7     8     9   │
│ $315  $289  $267  $312  $356  $401  $378 │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Color coding:**
- Green: cheapest 20% of days
- Yellow: middle range
- Red: most expensive 20%
- Gray: no data / past dates

**Behavior:**
- Clicking a date updates the departure date and triggers a new search
- Navigate between months with arrow buttons
- Display loading skeleton while fetching prices

### Step 6.2 — Data Fetching Strategy

The Amadeus test API may not have a dedicated "cheapest dates" endpoint that works well in test mode. Implement a fallback:

```typescript
// Option A: Use /v1/analytics/itinerary-price-metrics if available
// Option B: Batch flight-offers requests for each day in the visible month
//   - Use Promise.allSettled for parallel requests
//   - Cache results aggressively (prices won't change that fast)
//   - Show progressive loading: render each day's price as it arrives
```

---

## Phase 7: Skeleton Loading & Animations

### Step 7.1 — Skeleton Components

Create shimmer-effect loading placeholders:

**SkeletonCard:**
```
┌──────────────────────────────────────────┐
│  ████████           ← price placeholder  │
│  ████ ████  ──────  ████ ████            │
│  ██████████████████████████              │
└──────────────────────────────────────────┘
```

**SkeletonGraph:**
- Animated bars of varying heights

**Implementation:**
```css
/* Skeleton.module.css */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    #f0f0f0 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Step 7.2 — Transition Animations

- Flight cards: fade + slide in when results load or filters change
- Price graph: smooth bar height transitions (Recharts built-in)
- Filter panel: slide-in drawer on mobile
- Calendar: fade between months

Use CSS transitions, not heavy animation libraries. Keep it performant.

---

## Phase 8: Responsive Design

### Step 8.1 — Breakpoint Strategy

```css
/* Mobile-first approach in CSS Modules */

/* Base: Mobile (< 640px) */
.container { padding: var(--space-md); }

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .container { padding: var(--space-lg); }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .resultsLayout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--space-lg);
  }
}

/* Wide (≥ 1280px) */
@media (min-width: 1280px) {
  .resultsLayout {
    grid-template-columns: 300px 1fr;
  }
}
```

### Step 8.2 — Mobile-Specific UX

- **Search form:** Stack vertically, full-width inputs
- **Filters:** Hidden behind a "Filters" button → opens as a bottom sheet / drawer
- **Flight cards:** Simplified layout, price prominent
- **Price graph:** Smaller height, touch-friendly tooltips
- **Calendar:** Horizontally scrollable or week view
- **Navigation:** Sticky compact search bar at top

### Step 8.3 — Touch Interactions

- Slider filters must be touch-friendly (large hit targets, ≥44px)
- Swipe to dismiss mobile filter drawer
- No hover-dependent interactions on mobile

---

## Phase 9: TypeScript Types

### `src/lib/types.ts`

```typescript
// ----- API Response Types -----

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: OfferPrice;
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

interface Itinerary {
  duration: string; // ISO 8601: "PT6H15M"
  segments: Segment[];
}

interface Segment {
  departure: { iataCode: string; terminal?: string; at: string };
  arrival: { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

interface OfferPrice {
  currency: string;
  total: string;
  base: string;
  fees: { amount: string; type: string }[];
  grandTotal: string;
}

// ----- App-Level Types -----

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
}

interface Flight {
  id: string;
  price: number;
  currency: string;
  airline: string;
  airlineName: string;
  stops: number;
  duration: number;       // total minutes
  departureTime: Date;
  arrivalTime: Date;
  origin: string;
  destination: string;
  itineraries: Itinerary[];
  raw: AmadeusFlightOffer; // keep full data for details view
}

interface SearchParams {
  origin: Airport;
  destination: Airport;
  departureDate: string;  // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  tripType: 'roundTrip' | 'oneWay';
}

interface FilterState {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
  departureTimeRange: [number, number];
  arrivalTimeRange: [number, number];
  maxDuration: number;
  sortBy: 'best' | 'price' | 'duration' | 'departure';
}

interface PriceCalendarDay {
  date: string;
  minPrice: number | null;
  loading: boolean;
}
```

---

## Phase 10: Data Flow & State Architecture

### Search Flow

```
User fills form → Click "Search"
  ↓
Router pushes to /results?origin=JFK&destination=LAX&...
  ↓
Results page reads URL params (useURLState hook)
  ↓
useFlightSearch hook calls /api/flights
  ↓
API route handler calls Amadeus API server-side
  ↓
Raw response normalized into Flight[] (useFlightSearch)
  ↓
Stored in SearchContext: { flights, filteredFlights, filters }
  ↓
UI renders: FlightList + PriceGraph (both read filteredFlights)
```

### Filter Flow

```
User changes any filter
  ↓
dispatch({ type: 'SET_FILTER', payload: { ... } })
  ↓
Reducer updates FilterState
  ↓
useMemo recalculates filteredFlights from flights + filters
  ↓
FlightList re-renders with new list
PriceGraph re-renders with new chart data
Result count updates
  ↓
All happens in ONE render cycle — no API calls, fully client-side
```

---

## Implementation Order (Recommended)

Follow this order to always have a working, demoable application:

### Milestone 1: Search Works (~3 hours)
1. Project setup + design tokens + global styles
2. Amadeus auth client
3. `/api/airports` route + AirportInput with autocomplete
4. SearchForm with all inputs
5. URL-based navigation to results page
6. `/api/flights` route
7. Basic FlightList + FlightCard (no filters yet)
8. Skeleton loading states

### Milestone 2: Filters + Graph (~4 hours)
9. FilterPanel with all filter components
10. Filter logic in context (useReducer + useMemo)
11. Wire filters → flight list (instant updates)
12. PriceGraph with Recharts
13. Wire filters → graph (live updates)
14. Chart ↔ filter interaction (clicking chart bars)

### Milestone 3: Responsive (~3 hours)
15. Mobile layout for search form
16. Mobile filter drawer (Modal component)
17. Responsive flight cards
18. Responsive price graph
19. Touch-friendly sliders and controls
20. Test on various screen sizes

### Milestone 4: Polish & Extras (~4 hours)
21. PriceCalendar component
22. Shareable URL state (ensure all search + filter state in URL)
23. Loading animations (skeleton shimmer, card transitions)
24. Empty states and error handling
25. Sort functionality
26. Favicon, metadata, README
27. Final design polish pass

### Milestone 5: QA & Deploy (~2 hours)
28. Cross-browser testing
29. Mobile device testing
30. Edge cases (no results, API errors, rate limits)
31. Performance audit (no unnecessary re-renders)
32. Deploy to Vercel
33. Write comprehensive README

---

## Key API Notes (Amadeus Test Environment)

### Limitations to be aware of:
- Test environment has **limited data** — not all routes return results
- Common test routes that work: `MAD-BCN`, `NYC-MAD`, `LON-PAR`, `JFK-LAX`
- Rate limits: ~10 requests/second in test mode
- Prices are test data, not real
- Some advanced endpoints may return empty results in test mode

### Recommended test searches:
- JFK → LAX (domestic US, lots of results)
- NYC → LON (transatlantic, varied stops)
- MAD → BCN (European short-haul)
- CDG → FCO (European)

### API Gotchas:
- Duration format is ISO 8601: `PT6H15M` → parse with regex or date-fns
- Carrier codes need dictionary lookup (included in response as `dictionaries.carriers`)
- Prices come as strings, always parse to numbers
- `numberOfBookableSeats` can be 0 — handle gracefully

---

## Design Principles

1. **Not a Google Flights clone** — Take UX inspiration but create your own visual identity. Think: what would a modern travel startup build?

2. **Information hierarchy** — Price is king. Make it the most prominent element. Then route + times. Then details.

3. **Progressive disclosure** — Show essential info first, expand for details. Don't overwhelm with data.

4. **Responsive-first** — Design mobile layout first. Desktop should feel spacious, not just stretched.

5. **Instant feedback** — Every interaction should feel immediate. Use optimistic UI, skeletons, and transitions.

6. **Accessibility** — Semantic HTML, ARIA labels on interactive elements, keyboard navigation, sufficient color contrast.

---

## Error Handling Checklist

- [ ] API key missing → clear error message in console + fallback UI
- [ ] Amadeus rate limit → retry with exponential backoff (max 3 retries)
- [ ] No flights found → friendly empty state with suggestions
- [ ] Network error → retry button + cached results if available
- [ ] Invalid dates → inline validation before search
- [ ] Airport not found → "No matching airports" in dropdown
- [ ] Price calendar day with no data → gray cell, no price shown

---

## README Template

The README.md should include:
1. **Quick start** — Clone, install, add env vars, run
2. **Live demo link** (Vercel deployment)
3. **Screenshots** — Desktop + mobile views
4. **Tech stack** — Framework, styling, API, charts
5. **Architecture decisions** — Why Next.js, why CSS Modules, state management approach
6. **Features list** — All implemented features with brief descriptions
7. **API setup** — How to get Amadeus test credentials
8. **Known limitations** — Test API constraints, etc.
