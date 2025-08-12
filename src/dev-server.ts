import "dotenv/config";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setupMCPServer } from "./mcp-server-setup.js";
import express from "express";
import cors from "cors";
import {
    getDevIndex,
    handleDevRestaurants,
    handleDevRestaurant,
    handleDevMenu,
    handleDevOrder,
    handleDevReceipt,
} from "./dev-routes.js";

const MCP_HOST = process.env.MCP_HOST || "127.0.0.1";
const MCP_PORT = Number(process.env.MCP_PORT || 8000);

const server = setupMCPServer();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", exposedHeaders: ["Mcp-Session-Id"] }));

// Dev-only HTML previews (standalone in a browser)
app.get("/", (_req, res) => {
    res.type("html").send(getDevIndex());
});

app.get("/dev", (_req, res) => {
    res.type("html").send(getDevIndex());
});

app.get("/dev/restaurants", async (req, res) => {
    await handleDevRestaurants(req, res);
});

app.get("/dev/restaurant/:id", async (req, res) => {
    await handleDevRestaurant(req, res);
});

app.get("/dev/menu/:id", async (req, res) => {
    await handleDevMenu(req, res);
});

app.get("/dev/order/:id", async (req, res) => {
    await handleDevOrder(req, res);
});

app.get("/dev/receipt/:id", async (req, res) => {
    await handleDevReceipt(req, res);
});

// Fake OAuth authorize endpoint for dev
app.get("/authorize", async (req, res) => {
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

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
});
const connectPromise = (async () => {
    try {
        await server.connect(transport);
    } catch (err) {
        console.error("Failed to connect MCP server:", err);
    }
})();

app.post("/mcp", async (req, res) => {
    try {
        await connectPromise;
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
    console.log(`Dev preview available at http://${MCP_HOST}:${MCP_PORT}/dev`);
});
