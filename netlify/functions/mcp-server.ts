import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setupMCPServer } from "../../src/mcp-server-setup";
import express, { Request, Response } from "express";
import serverless from "serverless-http";

// Create Express app
const app = express();
app.use(express.json());

// MCP endpoint
app.post("/mcp", async (req: Request, res: Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.

    console.log("Received POST MCP request", { body: req.body });

    try {
        const server = setupMCPServer();
        const transport: StreamableHTTPServerTransport =
            new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });
        await server.connect(transport);
        await transport.handleRequest(req, res);
        res.on("close", () => {
            console.log("Request closed");
            transport.close();
            server.close();
        });
    } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error",
                },
                id: null,
            });
        }
    }
});

// OAuth-like authorize endpoint for clients (e.g., Goose)
// This fakes a successful auth by redirecting back to the provided redirect_uri
// with a mock code and preserved state.
app.get("/authorize", async (req: Request, res: Response) => {
    try {
        const redirectUriRaw = (req.query?.redirect_uri ?? "") as string;
        const state = (req.query?.state ?? "") as string;
        if (!redirectUriRaw) {
            res.status(400).send("Missing redirect_uri");
            return;
        }
        const mockCode = `mock_${Math.random().toString(36).slice(2, 10)}`;
        const url = new URL(redirectUriRaw);
        url.searchParams.set("code", mockCode);
        if (state) url.searchParams.set("state", state);
        res.redirect(302, url.toString());
    } catch (err) {
        console.error("/authorize error:", err);
        res.status(500)
            .type("html")
            .send(
                "<html><body><h1>Authorization Error</h1><p>There was a problem handling the request. You can close this window.</p></body></html>"
            );
    }
});

app.get("/mcp", (_req: Request, res: Response) => {
    // For the stateless server, GET requests are used to initialize
    // SSE connections which are stateful. Therefore, we don't need
    // to handle GET requests but we can signal to the client this error.
    console.log("Received GET MCP request");
    res.status(405).json({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "Method not allowed.",
        },
        id: null,
    });
});

app.delete("/mcp", (_req: Request, res: Response) => {
    console.log("Received DELETE MCP request");
    res.status(405).json({
        jsonrpc: "2.0",
        error: {
            code: -32000,
            message: "DELETE not supported. Use POST for all requests.",
        },
    });
});

// Dev routes
app.get("/", async (_req: Request, res: Response) => {
    const { getDevIndex } = await import("../../src/dev-routes.js");
    res.type("html").send(getDevIndex());
});

app.get("/dev", async (_req: Request, res: Response) => {
    const { getDevIndex } = await import("../../src/dev-routes.js");
    res.type("html").send(getDevIndex());
});

app.get("/dev/restaurants", async (req: Request, res: Response) => {
    const { handleDevRestaurants } = await import("../../src/dev-routes.js");
    await handleDevRestaurants(req, res);
});

app.get("/dev/restaurant/:id", async (req: Request, res: Response) => {
    const { handleDevRestaurant } = await import("../../src/dev-routes.js");
    await handleDevRestaurant(req, res);
});

app.get("/dev/menu/:id", async (req: Request, res: Response) => {
    const { handleDevMenu } = await import("../../src/dev-routes.js");
    await handleDevMenu(req, res);
});

app.get("/dev/order/:id", async (req: Request, res: Response) => {
    const { handleDevOrder } = await import("../../src/dev-routes.js");
    await handleDevOrder(req, res);
});

app.get("/dev/receipt/:id", async (req: Request, res: Response) => {
    const { handleDevReceipt } = await import("../../src/dev-routes.js");
    await handleDevReceipt(req, res);
});

export const handler = serverless(app);
