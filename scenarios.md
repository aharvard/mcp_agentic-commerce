## Interaction model (for all scenarios)

-   **First agent response**: Always returns an MCP UI block (list or details) so the user can click.
-   **Subsequent turns**: The user clicks in the UI; the UI dispatches a message (tool invocation). The agent executes the tool(s) and returns updated UI.
-   **Seller platform**: The agent silently checks whether a seller uses Square. Users are not asked to care. If Square, the agent can show rich details, verified menu with prices and images, and allow direct ordering. If not Square, show a details view with website link, phone, hours, and guidance.
-   **Ordering**: If the user tries to order, the agent checks platform first. If Square, proceed with in‑chat ordering. Otherwise, present fallback options (call, website, maps link).

---

## Scenario A — Nearby coffee, click‑through to order (Square seller behind the scenes)

-   **Human**: Which local coffee shops are around me near downtown Atlanta?
-   **Agent**: Returns MCP UI: "Nearby Coffee" — a list of cards with name, rating, distance, and a "View" button for each seller.
    -   (Under the hood: find_restaurants → detect_seller_square for each result, but not surfaced.)
-   **Human action (click)**: Clicks "View" on Bluebird Coffee.
    -   UI dispatch: `{ tool: "view_menu", params: { business_id: "bluebird-coffee-ATL-001" } }`
-   **Agent**: Returns MCP UI: "Bluebird Coffee" — details view with address, hours, and a "View Menu" button.
-   **Human action (click)**: Clicks "View Menu".
    -   UI dispatch: `{ tool: "view_catalog", params: { business_id: "bluebird-coffee-ATL-001" } }`
-   **Agent**: Returns MCP UI: "Menu" — verified items with pictures and prices, each with an "Add" button and an "Order" CTA.
-   **Human action (click)**: Adds 2 Lattes and 1 Blueberry Muffin, then clicks "Order".
    -   UI dispatch: `{ tool: "order_takeout", params: { business_id: "bluebird-coffee-ATL-001", items: [...] } }`
-   **Agent**: Returns MCP UI: "Takeout Order" — shows line items and total, with a "Place order" button.
-   **Human action (click)**: Clicks "Place order".
-   **Agent**: Confirms in UI: "Order placed. Ready at 9:15 AM. Name: Sam." Offers "Add to calendar" / "Share".

---

## Scenario B — Nearby coffee, selected seller is not Square (graceful fallback)

-   **Human**: Show coffee around 33.749, -84.388.
-   **Agent**: Returns MCP UI: "Nearby Coffee" list.
-   **Human action (click)**: Clicks "View" on Peachtree Roasters.
    -   UI dispatch: `{ tool: "view_menu", params: { business_id: "peachtree-roasters-ATL-009" } }`
-   **Agent**: Detects non‑Square. Returns MCP UI: "Seller Details" with:
    -   Address, phone, hours
    -   Primary action: "Open Website"
    -   Secondary actions: "Call", "Directions"
    -   Informational note: "In‑chat ordering not available yet."
-   **Human action (click)**: Clicks "Open Website" (opens external site in new tab).
-   Optional next step: The user navigates back and clicks another seller from the list; if that seller is Square, flow proceeds like Scenario A.

---

## Scenario C — Direct seller identifier (agent handles platform detection)

-   **Human**: I have a seller ID: bluebird-coffee-ATL-001. What’s on their menu?
-   **Agent**: Runs Square detection silently. Returns MCP UI: "Menu" with verified items (pictures + prices) and ordering controls.
-   **Human action (click)**: Chooses pastries only, adds items, places order.
-   **Agent**: Confirms order in UI and offers follow‑ups (share, add reminder).

---

## Scenario D — User says "Order two lattes from Midtown Bean at 9:15"

-   **Human**: Order two lattes from Midtown Bean at 9:15 under Sam.
-   **Agent**:
    -   Parses intent and checks seller platform.
    -   If Square: shows MCP UI "Order" prefilled (2× Latte), time note, and a "Place order" button.
    -   If non‑Square: shows MCP UI "Seller Details" with a note: "Ordering in chat isn’t supported yet. Use the website or call to place your order," including quick actions.

---

## Non‑Square seller incentive concept (bonus)

-   **Context**: When the agent detects a non‑Square seller and the user attempts to order, present a subtle, user‑friendly banner in the details UI.
-   **Banner copy (example)**:
    -   "Customers are trying to order here. Enable in‑chat ordering with Square to accept orders directly from assistants."
    -   CTA for sellers: "Learn about Square Ordering" (external link with UTM for agent channel).
-   **Placement**: Below the contact actions on the non‑Square seller details UI. Hidden from typical users behind a small expandable info row so it doesn’t disrupt.
-   **Rationale**: This turns observed demand (agent users attempting orders) into a conversion path for non‑Square merchants without interrupting the buyer’s flow.

---

## Notes for implementation

-   The UI actions above map to existing tools:
    -   `find_restaurants` → list
    -   `view_menu` → seller details
    -   `view_catalog` → verified menu (Square only)
    -   `order_takeout` → order summary/confirmation
-   The agent should always:
    -   Show UI on its first reply to a user query.
    -   Perform platform detection silently and select the appropriate UI.
    -   Fall back to external links and contact details when ordering isn’t available.
