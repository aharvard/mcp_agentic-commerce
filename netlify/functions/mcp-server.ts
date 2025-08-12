import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setupMCPServer } from "../../src/mcp-server-setup.js";
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
