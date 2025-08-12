import "dotenv/config";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setupMCPServer } from "../../src/mcp-server-setup.js";
import express from "express";
import cors from "cors";
import {
    getDevIndex,
    handleDevRestaurants,
    handleDevRestaurant,
    handleDevMenu,
    handleDevOrder,
    handleDevReceipt,
} from "../../src/dev-routes.js";

const MCP_HOST = process.env.MCP_HOST || "127.0.0.1";
const MCP_PORT = Number(process.env.MCP_PORT || 8000);

const server = setupMCPServer();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", exposedHeaders: ["Mcp-Session-Id"] }));

// Dev-only HTML previews (standalone in a browser)
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
