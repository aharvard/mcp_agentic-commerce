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

const server = new McpServer({ name: "restaurant-finder", version: "1.0.0" });

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
        const results = await searchRestaurants(
            query || "restaurants",
            latitude,
            longitude,
            limit
        );
        const html = restaurantsHtml(results.businesses || []);
        const block = createUIResource({
            uri: `ui://restaurants/list`,
            content: { type: "rawHtml", htmlString: html },
            encoding: "text",
        });
        return { content: [block] };
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
                },
            ],
            isError: false,
        } as any;
    }
);

server.tool(
    "view_menu",
    "View menu/info for a restaurant by Yelp business id.",
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
        return { content: [block] };
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
        return { content: [block] };
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
        return { content: [block] };
    }
);

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", exposedHeaders: ["Mcp-Session-Id"] }));

// No static UI or token data routes needed anymore (UI is embedded as rawHtml)

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
