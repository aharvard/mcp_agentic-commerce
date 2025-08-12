import "dotenv/config";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRestaurant, searchRestaurants } from "./lib/restaurants.js";
import { createUIResource } from "@mcp-ui/server";
import {
    searchResultsHtml,
    restaurantDetailsHtml,
    orderHtml,
    menuHtml,
    receiptHtml,
} from "./ui/index.js";
import {
    detectSquareForBusinessId,
    getCatalogForBusinessId,
    getCatalogByMerchantToken,
    getGenericMenuByCategory,
} from "./lib/square.js";

export const SERVER_NAME = "agentic_commerce";

export const setupMCPServer = (): McpServer => {
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
                const summaryText = `Found ${businesses.length} result${businesses.length === 1 ? '' : 's'}${query ? ` for "${query}"` : ''}${locationStr ? ` near ${locationStr}` : ''}.${topNames ? ` Top: ${topNames}.` : ''}`;
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

    server.tool(
        "view_receipt",
        "Render a playful receipt for an order (demo only).",
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
            const html = receiptHtml(details, items as any);
            const block = createUIResource({
                uri: `ui://receipt/${business_id}`,
                content: { type: "rawHtml", htmlString: html },
                encoding: "text",
            });
            const annotated = {
                ...(block as any),
                annotations: { audience: ["user"] },
                _meta: { server: SERVER_NAME },
            };
            return { content: [annotated] };
        }
    );

    return server;
};
