import "dotenv/config";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getRestaurant, searchRestaurants } from "./lib/restaurants.js";
import { createUIResource } from "@mcp-ui/server";
import {
    searchResultsHtml,
    restaurantDetailsHtml,
    orderHtml,
    menuHtml,
} from "./ui/index.js";
import {
    detectSquareForBusinessId,
    getCatalogForBusinessId,
    getCatalogByMerchantToken,
    getGenericMenuByCategory,
} from "./lib/square.js";

const MCP_HOST = process.env.MCP_HOST || "127.0.0.1";
const MCP_PORT = Number(process.env.MCP_PORT || 8000);

export const SERVER_NAME = "commerce_localhost";

const server = new McpServer(
    { name: SERVER_NAME, version: "1.0.0" },
    {
        instructions:
            "Return MCP UI as the primary output. Do not summarize UI, do not propose filters or next steps, and do not restate what is visible. After returning UI, WAIT for UI-dispatched tool messages (type=tool) and respond with updated UI only. Emit plain text ONLY for errors or when no UI can be rendered.",
    }
);

server.tool(
    "find_restaurants",
    "Find nearby restaurants by city/state and optional query.",
    {
        city: z.string().default("Austin"),
        state: z.string().optional(),
        query: z.string().optional(),
        limit: z.number().int().min(1).max(25).default(10),
    },
    async ({ city, state, query, limit }) => {
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
                return {
                    content: [
                        {
                            type: "text",
                            text: `No local results for ${[city, state]
                                .filter(Boolean)
                                .join(", ")}${
                                query ? ` (query=\"${query}\")` : ""
                            }.${suggestions}`,
                            annotations: { audience: ["user"] },
                        },
                    ],
                } as any;
            }
            const locationStr2 = [city, state].filter(Boolean).join(", ");
            const dynamicTitle = `${
                query ? `Results for "${query}"` : "Nearby Restaurants"
            }${locationStr2 ? ` — ${locationStr2}` : ""}`;
            const html = searchResultsHtml(businesses, dynamicTitle);
            const block = createUIResource({
                uri: `ui://restaurants/list`,
                content: { type: "rawHtml", htmlString: html },
                encoding: "text",
            });
            const annotatedUi = {
                ...(block as any),
                annotations: { audience: ["user"] },
                _meta: {
                    server: SERVER_NAME,
                },
            };
            // Provide a concise textual summary for the LLM while keeping UI as primary output
            const locationStr = [city, state].filter(Boolean).join(", ");
            const topNames = businesses
                .slice(0, 3)
                .map((b: any) => b.name)
                .filter(Boolean)
                .join(", ");
            const summaryText = `Found ${businesses.length} result$${"{"}
                businesses.length === 1 ? '' : 's'
            ${"}"}${query ? ` for "${query}"` : ""}${
                locationStr ? ` near ${locationStr}` : ""
            }.${topNames ? ` Top: ${topNames}.` : ""}`;
            const llmSummary = {
                type: "text",
                text: summaryText,
                annotations: { audience: ["assistant"] },
            } as const;
            return { content: [annotatedUi, llmSummary as any] };
        } catch (error: any) {
            const code = (error && (error as any).code) || "UNKNOWN";
            const human =
                code === "GEOCODE_NOT_FOUND"
                    ? `Could not find a location for "${[city, state]
                          .filter(Boolean)
                          .join(
                              ", "
                          )}". Try a different city or include a state (e.g., "Austin, TX").`
                    : code === "LOCATION_REQUIRED"
                    ? "Location is required. Provide a city (and optional state)."
                    : "We hit a temporary issue fetching nearby places. Please try again shortly.";
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                message: human,
                                code,
                                input: { city, state, query, limit },
                            },
                            null,
                            2
                        ),
                        annotations: { audience: ["user"] },
                    },
                ],
                isError: true,
            } as any;
        }
    }
);

server.tool(
    "detect_seller_square",
    "Determine if a seller uses Square and return detection details.",
    { business_id: z.string(), website_url: z.string().optional() },
    async ({ business_id, website_url }) => {
        const info = detectSquareForBusinessId(business_id, website_url);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(info, null, 2),
                    annotations: { audience: ["user"] },
                },
            ],
            isError: false,
        } as any;
    }
);

server.tool(
    "view_restaurant",
    "View restaurant details by id.",
    { business_id: z.string() },
    async ({ business_id }) => {
        const details = await getRestaurant(business_id);
        const square = detectSquareForBusinessId(
            business_id,
            (details as any)?.website
        );
        const html = restaurantDetailsHtml({ ...(details as any), square });
        const block = createUIResource({
            uri: `ui://restaurant/${business_id}`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        const annotated = {
            ...(block as any),
            annotations: { audience: ["user"] },
            _meta: {
                server: SERVER_NAME,
            },
        };
        return {
            content: [annotated],
        };
    }
);

server.tool(
    "order_takeout",
    "Simulate placing a takeout order for items.",
    {
        business_id: z.string(),
        items: z.array(
            z.object({
                name: z.string(),
                qty: z.number().int().default(1),
                price: z.number().default(0),
            })
        ),
    },
    async ({ business_id, items }) => {
        const details = await getRestaurant(business_id);
        const html = orderHtml(details, items as any);
        const block = createUIResource({
            uri: `ui://order/${business_id}`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        const annotated = {
            ...(block as any),
            annotations: { audience: ["user"] },
            _meta: {
                server: SERVER_NAME,
            },
        };
        return {
            content: [annotated],
        };
    }
);

server.tool(
    "view_menu",
    "Read a seller's menu (if Square) and display items with price and image.",
    { business_id: z.string() },
    async ({ business_id }) => {
        const details = await getRestaurant(business_id);
        const square = detectSquareForBusinessId(
            business_id,
            (details as any)?.website
        );
        // Prefer Square catalogs when available
        let items = square.usesSquare
            ? square.merchantToken
                ? await getCatalogByMerchantToken(square.merchantToken)
                : await getCatalogForBusinessId(business_id)
            : [];
        // If none, fallback to our local generic menu using the business's primary category
        if (!items.length) {
            const details = await getRestaurant(business_id);
            const primary = (details as any)?.categories?.[0]?.alias;
            if (primary) items = getGenericMenuByCategory(primary);
        }
        if (!items.length) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No menu available for this seller.",
                        annotations: { audience: ["user"] },
                    },
                ],
            } as any;
        }
        const html = menuHtml(
            business_id,
            (details as any)?.name ?? "Seller",
            items
        );
        const block = createUIResource({
            uri: `ui://menu/${business_id}`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        const annotated = {
            ...(block as any),
            annotations: { audience: ["user"] },
            _meta: {
                server: SERVER_NAME,
            },
        };
        return {
            content: [annotated],
        };
    }
);

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", exposedHeaders: ["Mcp-Session-Id"] }));

// Dev-only HTML previews (standalone in a browser)
app.get("/dev", (_req, res) => {
    res.type("html")
        .send(`<!doctype html><html><body style=\"font-family:system-ui;padding:20px\"> 
    <h2>MCP UI Dev Links</h2>
    <ul>
      <li><a href=\"/dev/restaurants\">Search Results (default)</a> — <code>src/ui/searchResultsHtml.ts</code></li>
      <li><a href=\"/dev/restaurants?city=Austin&state=TX&query=bbq\">Search Results (Austin, TX; query=bbq)</a> — <code>src/ui/searchResultsHtml.ts</code></li>
      <li><a href=\"/dev/restaurant/atx-franklin\">Restaurant Details: Franklin Barbecue</a> — <code>src/ui/restaurantDetailsHtml.ts</code></li>
      <li><a href=\"/dev/menu/atx-franklin\">Menu: Franklin (mock)</a> — <code>src/ui/menuHtml.ts</code></li>
      <li><a href=\"/dev/order/atx-franklin\">Order: Franklin (mock)</a> — <code>src/ui/orderHtml.ts</code></li>
    </ul>
    <p>Query params supported on /dev/restaurants: city, state, query, limit</p>
    </body></html>`);
});

app.get("/dev/restaurants", async (req, res) => {
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
            query ? `Results for "${query}"` : "Nearby Restaurants"
        } in ${[city, state].filter(Boolean).join(", ") || "your area"}`;
        const html = searchResultsHtml(businesses, title);
        res.type("html").send(html);
    } catch (error: any) {
        const code = (error && (error as any).code) || "UNKNOWN";
        const human =
            code === "GEOCODE_NOT_FOUND"
                ? `Could not find a location for "${[city, state]
                      .filter(Boolean)
                      .join(
                          ", "
                      )}". Try a different city or include a state (e.g., "Austin, TX").`
                : code === "LOCATION_REQUIRED"
                ? "Location is required. Provide a city (and optional state)."
                : "We hit a temporary issue fetching nearby places. Please try again shortly.";
        res.status(400).type("text").send(`${human} (code=${code})`);
    }
});

app.get("/dev/restaurant/:id", async (req, res) => {
    const details = await getRestaurant(req.params.id);
    const html = restaurantDetailsHtml(details);
    res.type("html").send(html);
});

app.get("/dev/menu/:id", async (req, res) => {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const items = await getCatalogForBusinessId(id);
    const html = menuHtml(id, (details as any)?.name ?? "Seller", items);
    res.type("html").send(html);
});

app.get("/dev/order/:id", async (req, res) => {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const html = orderHtml(details as any, [
        { name: "Sample Item A", qty: 1, price: 9.99 },
        { name: "Sample Item B", qty: 2, price: 4.25 },
    ]);
    res.type("html").send(html);
});

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
});
await server.connect(transport);

app.post("/mcp", async (req, res) => {
    try {
        await transport.handleRequest(req as any, res as any, req.body);
    } catch (err) {
        console.error("Error handling MCP request:", err);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Internal server error" },
                id: null,
            });
        }
    }
});

app.get("/mcp", (_req, res) => {
    res.status(405).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed." },
        id: null,
    });
});

app.delete("/mcp", (_req, res) => {
    res.status(405).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed." },
        id: null,
    });
});

app.listen(MCP_PORT, MCP_HOST, () => {
    console.log(`MCP (Streamable HTTP) on http://${MCP_HOST}:${MCP_PORT}/mcp`);
});
