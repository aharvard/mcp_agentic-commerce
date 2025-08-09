import "dotenv/config";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getRestaurant, searchRestaurants } from "./lib/restaurants.js";
import { createUIResource } from "@mcp-ui/server";
import {
    restaurantsHtml,
    menuHtml,
    orderHtml,
    catalogHtml,
} from "./ui/index.js";
import {
    detectSquareForBusinessId,
    getCatalogForBusinessId,
    getCatalogByMerchantToken,
} from "./lib/square.js";

const MCP_HOST = process.env.MCP_HOST || "127.0.0.1";
const MCP_PORT = Number(process.env.MCP_PORT || 8000);

const server = new McpServer(
    { name: "restaurant-finder", version: "1.0.0" },
    {
        instructions:
            "You are a helpful assistant that can find restaurants and view their menus and catalogs.",
    }
);

server.tool(
    "find_restaurants",
    "Find nearby restaurants by coordinates and optional query.",
    {
        latitude: z.number().default(33.749),
        longitude: z.number().default(-84.388),
        query: z.string().optional(),
        limit: z.number().int().min(1).max(25).default(10),
    },
    async ({ latitude, longitude, query, limit }) => {
        try {
            const results = await searchRestaurants(
                query,
                latitude,
                longitude,
                limit
            );
            const businesses = results.businesses || [];
            const html = restaurantsHtml(businesses);
            const block = createUIResource({
                uri: `ui://restaurants/list`,
                content: { type: "rawHtml", htmlString: html },
                encoding: "text",
            });
            const annotatedUi = {
                ...(block as any),
                annotations: { audience: ["user"] },
            };
            const content: any[] = [annotatedUi];
            if (!businesses.length) {
                const debug = {
                    message:
                        "No places returned. This can happen if the map provider is rate-limited or the search is too narrow.",
                    input: { latitude, longitude, query, limit },
                    meta: results.meta ?? null,
                    suggestions: results.suggestions ?? [
                        "Try a broader term (e.g., 'restaurant' or 'food')",
                        "Zoom out by increasing the search radius",
                        "Try again in a minute in case of provider throttling",
                    ],
                };
                content.push({
                    type: "text",
                    text: JSON.stringify(debug, null, 2),
                    annotations: { audience: ["user"] },
                });
            }
            return { content };
        } catch (error: any) {
            const info = {
                message:
                    "We hit a temporary issue fetching nearby places. Please try again shortly.",
                input: { latitude, longitude, query, limit },
                error: String(error?.message || error),
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(info, null, 2),
                        annotations: { audience: ["user"] },
                    },
                ],
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
    "view_menu",
    "View menu/info for a restaurant by id.",
    { business_id: z.string() },
    async ({ business_id }) => {
        const details = await getRestaurant(business_id);
        const square = detectSquareForBusinessId(
            business_id,
            (details as any)?.website
        );
        const html = menuHtml({ ...(details as any), square });
        const block = createUIResource({
            uri: `ui://menu/${business_id}`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        const annotated = {
            ...(block as any),
            annotations: { audience: ["user"] },
        };
        return { content: [annotated] };
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
        };
        return { content: [annotated] };
    }
);

server.tool(
    "view_catalog",
    "Read a seller's catalog (if Square) and display items with price and image.",
    { business_id: z.string() },
    async ({ business_id }) => {
        const details = await getRestaurant(business_id);
        const square = detectSquareForBusinessId(
            business_id,
            (details as any)?.website
        );
        if (!square.usesSquare) {
            return {
                content: [
                    {
                        type: "text",
                        text: "This seller does not appear to use Square. Catalog not available.",
                        annotations: { audience: ["user"] },
                    },
                ],
            } as any;
        }
        // Prefer merchant token lookup when available to model 0c
        const items = square.merchantToken
            ? await getCatalogByMerchantToken(square.merchantToken)
            : await getCatalogForBusinessId(business_id);
        const html = catalogHtml(
            business_id,
            (details as any)?.name ?? "Seller",
            items
        );
        const block = createUIResource({
            uri: `ui://catalog/${business_id}`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        const annotated = {
            ...(block as any),
            annotations: { audience: ["user"] },
        };
        return { content: [annotated] };
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
      <li><a href=\"/dev/restaurants\">Restaurants List (default)</a></li>
      <li><a href=\"/dev/restaurants?query=bbq\">Restaurants List (query=bbq)</a></li>
      <li><a href=\"/dev/menu/atx-franklin\">Menu: Franklin Barbecue</a></li>
      <li><a href=\"/dev/catalog/atx-franklin\">Catalog: Franklin (mock)</a></li>
      <li><a href=\"/dev/order/atx-franklin\">Order: Franklin (mock)</a></li>
    </ul>
    <p>Query params supported on /dev/restaurants: latitude, longitude, query, limit</p>
    </body></html>`);
});

app.get("/dev/restaurants", async (req, res) => {
    const latitude = Number(req.query.latitude ?? 30.2672); // Austin
    const longitude = Number(req.query.longitude ?? -97.7431);
    const query =
        typeof req.query.query === "string" ? req.query.query : undefined;
    const limit = Number(req.query.limit ?? 10);
    const results = await searchRestaurants(query, latitude, longitude, limit);
    const html = restaurantsHtml(results.businesses || []);
    res.type("html").send(html);
});

app.get("/dev/menu/:id", async (req, res) => {
    const details = await getRestaurant(req.params.id);
    const html = menuHtml(details);
    res.type("html").send(html);
});

app.get("/dev/catalog/:id", async (req, res) => {
    const id = req.params.id;
    const details = await getRestaurant(id);
    const items = await getCatalogForBusinessId(id);
    const html = catalogHtml(id, (details as any)?.name ?? "Seller", items);
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
