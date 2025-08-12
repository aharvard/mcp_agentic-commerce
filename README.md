# Agentic Commerce MCP Demo (Goose + MCP UI)

A small Model Context Protocol (MCP) server that showcases agentic commerce UX using MCP UI blocks inside [Goose](https://block.github.io/goose/). It returns rich, interactive HTML UI for a simple “find restaurants → view menu → fake order → receipt” flow.

Important notes:
- Demo only. No real sellers, data, payments, or money movement. Everything is synthetic or mocked.
- Not production code. This exists to demonstrate how MCP UI can drive a click-first agent experience.

## Features
- Streamable HTTP MCP server with multiple tools:
  - `find_restaurants` – search nearby synthetic restaurants by city/state and query
  - `view_restaurant` – details card for a restaurant
  - `view_menu` – menu with images and pricing (mock catalog if “Square” is detected; otherwise a generic menu fallback)
  - `order_takeout` – interactive order page (edit quantities, remove items)
  - `view_receipt` – playful, fake receipt
- Click-first MCP UI: UI dispatches tool calls back to the agent on user actions.
- Dev HTML previews for local testing at http://127.0.0.1:8000/dev
- Large, synthetic dataset you can regenerate via scripts

## What this is not
- No live Square API calls, no money movement, no real sellers or PII
- No persistent storage; no auth; no production hardening

## Repo layout
- `src/server.ts` – MCP server with tools that render UI
- `src/ui/*` – HTML shell, styles, and view builders
- `src/lib/restaurants.ts` – local search over synthetic sellers + geocoding via OpenStreetMap Nominatim
- `src/lib/square.ts` – tiny mock for “Square detection” and sample catalogs
- `src/data/*` – generated JSON for restaurants and category menus
- `src/scripts/*` – generators for the data above
- `scenarios.md` – example conversational flows and UX notes

## Prerequisites
- Node.js 20+
- npm (bundled with Node) or pnpm/yarn

## Setup
1) Install dependencies

```bash
npm install
```

2) Generate demo data (optional; the repo includes prebuilt JSON)

```bash
# Regenerate synthetic restaurants (5MB+ file)
# You can control density:
#   GEN_MIN_PER_CATEGORY=3 GEN_MAX_PER_CATEGORY=5 npm run generate:data
npm run generate:data

# Regenerate generic menus by category
npm run generate:menus
```

3) Run the MCP server (dev)

```bash
# Starts an HTTP (streamable) MCP server on 127.0.0.1:8000/mcp
npm run dev:mcp
```

Environment variables you can set:
- MCP_HOST (default: 127.0.0.1)
- MCP_PORT (default: 8000)
- MCP_GEOCODE_USERAGENT (default: "mcp-agentic-commerce/1.0 (+https://squareup.com)")

4) Try the local UI previews in a browser

- http://127.0.0.1:8000/dev
- Example: http://127.0.0.1:8000/dev/restaurants?city=Austin&state=TX&query=bbq

## Use with Goose
This project is designed to be consumed as an MCP extension by Goose.

Option A — Add manually in Goose settings:
- Open Goose Desktop → Settings → Extensions → Add MCP server
- Type: HTTP (streamable)
- URL: http://127.0.0.1:8000/mcp
- Name: Agentic Commerce MCP Demo
- Save. Start a new chat and ask something like:
  - “Find coffee around Austin”
  - “Show pizza near Toronto”
  - “Order two lattes from Midtown Bean at 9:15 under Sam.”

Option B — Use the MCP Inspector (handy for testing tools and UI):
```bash
# Runs the Inspector against this server
npm run dev:inspector
# Then open the printed Inspector URL; try executing tools directly
```

Tip: If your model/agent supports MCP UI, it will render the HTML cards, menus, and receipts inline and dispatch tool calls on button clicks.

## Tool reference
- `find_restaurants`
  - args: city (string, default "Austin"), state (optional), query (optional), limit (1..25, default 10)
  - returns: UI list of nearby sellers; buttons to “Details” and “Order Now”
- `view_restaurant`
  - args: business_id (string)
  - returns: UI card with address, hours, phone, website; CTA buttons
- `view_menu`
  - args: business_id (string)
  - behavior: if mock "Square" is detected -> use mock catalog; else generic menu by primary category
- `order_takeout`
  - args: business_id (string), items (array of { name, qty, price })
  - returns: interactive order table with totals and a Place Order button
- `view_receipt`
  - args: business_id (string), items (same as above)
  - returns: playful demo receipt UI

## Data notes
- Restaurants are synthetic and based on seeded generators across many US/CA cities. You can regenerate or reduce the dataset density via env vars on the generator script.
- Menu images are hotlinked from Unsplash and used only for illustrative purposes in this demo.

## Safety and disclaimers
- For demonstration only; do not treat any information as factual.
- No money movement occurs. The “Place order” flow only renders a confirmation UI.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
