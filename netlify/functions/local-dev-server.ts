import http from "http";
import { app } from "./express-mcp-server";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8888;

const server = http.createServer(app);

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Local MCP server running at http://localhost:${PORT}/mcp`);
});
