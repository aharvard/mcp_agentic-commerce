import { Request, Response } from "express";
import { getRestaurant, searchRestaurants } from "./lib/restaurants.js";
import {
    searchResultsHtml,
    restaurantDetailsHtml,
    orderHtml,
    menuHtml,
    receiptHtml,
} from "./ui/index.js";
import { getCatalogForBusinessId } from "./lib/square.js";

export function getDevIndex(): string {
    return `<!doctype html><html><body style="font-family:system-ui;padding:20px"> 
    <h2>MCP UI Dev Links</h2>
    <ul>
      <li><a href="/dev/restaurants">Search Results (default)</a> — <code>src/ui/searchResultsHtml.ts</code></li>
      <li><a href="/dev/restaurants?city=Austin&state=TX&query=bbq">Search Results (Austin, TX; query=bbq)</a> — <code>src/ui/searchResultsHtml.ts</code></li>
      <li><a href="/dev/restaurant/atx-franklin">Restaurant Details: Franklin Barbecue</a> — <code>src/ui/restaurantDetailsHtml.ts</code></li>
      <li><a href="/dev/menu/atx-franklin">Menu: Franklin (mock)</a> — <code>src/ui/menuHtml.ts</code></li>
      <li><a href="/dev/order/atx-franklin">Order: Franklin (mock)</a> — <code>src/ui/orderHtml.ts</code></li>
      <li><a href="/dev/receipt/atx-franklin">Receipt: Franklin (mock)</a> — <code>src/ui/receiptHtml.ts</code></li>
    </ul>
    <p>Query params supported on /dev/restaurants: city, state, query, limit</p>
    </body></html>`;
}

export async function handleDevRestaurants(req: Request, res: Response): Promise<void> {
    const city = typeof req.query.city === "string" ? req.query.city : "Austin";
    const state =
        typeof req.query.state === "string" ? req.query.state : undefined;
    const query =
        typeof req.query.query === "string" ? req.query.query : undefined;
    const limit = Number(req.query.limit ?? 10);
    try {
        const results = await searchRestaurants({
            term: query,
            city,
            state,
            limit,
        });
        const businesses = results.businesses || [];
        if (!businesses.length) {
            const suggestions = Array.isArray(results?.suggestions)
                ? `\nSuggestions: ${results.suggestions.join("; ")}`
                : "";
            res.type("text").send(
                `No local results for ${[city, state]
                    .filter(Boolean)
                    .join(", ")}${
                    query ? ` (query=\"${query}\")` : ""
                }.${suggestions}`
            );
            return;
        }
        const title = `${
            query ? `Results for \"${query}\"` : "Nearby Restaurants"
        } in ${[city, state].filter(Boolean).join(", ") || "your area"}`;
        const html = searchResultsHtml(businesses, title);
        res.type("html").send(html);
    } catch (error: any) {
        const code = (error && (error as any).code) || "UNKNOWN";
        const human =
            code === "GEOCODE_NOT_FOUND"
                ? `Could not find a location for \"${[city, state]
                      .filter(Boolean)
                      .join(
                          ", "
                      )}\". Try a different city or include a state (e.g., \"Austin, TX\").`
                : code === "LOCATION_REQUIRED"
                ? "Location is required. Provide a city (and optional state)."
                : "We hit a temporary issue fetching nearby places. Please try again shortly.";
        res.status(400).type("text").send(`${human} (code=${code})`);
    }
}

export async function handleDevRestaurant(req: Request, res: Response): Promise<void> {
    const details = await getRestaurant(req.params.id);
    const html = restaurantDetailsHtml(details);
    res.type("html").send(html);
}

export async function handleDevMenu(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const items = await getCatalogForBusinessId(id);
    const html = menuHtml(id, (details as any)?.name ?? "Seller", items);
    res.type("html").send(html);
}

export async function handleDevOrder(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const html = orderHtml(details as any, [
        { name: "Sample Item A", qty: 1, price: 9.99 },
        { name: "Sample Item B", qty: 2, price: 4.25 },
    ]);
    res.type("html").send(html);
}

export async function handleDevReceipt(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const html = receiptHtml(details as any, [
        { name: "Blueberry Muffin", qty: 1, price: 3.25 },
        { name: "Espresso", qty: 5, price: 3.0 },
    ]);
    res.type("html").send(html);
}
