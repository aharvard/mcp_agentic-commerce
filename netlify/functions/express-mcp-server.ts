import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setupMCPServer } from "../mcp-server";
import express, { Request, Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import serverless from "serverless-http";
// import type { Context } from "@netlify/functions"; // Removed unused import

// Create Express app
const app = express();

app.post("/mcp", async (req: Request, res: Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.

    console.log("Received POST MCP request");

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

app.get("/mcp", async (req: Request, res: Response) => {
    // Some transports perform a GET-based handshake/stream
    console.log("Received GET MCP request");
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
        console.error("Error handling MCP GET request:", error);
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

export const handler = serverless(app);

// Also export the Express app for local development usage
export { app };

// --- Mock OAuth 2.0 (PKCE) endpoints for local testing ---
type StoredAuthRequest = {
    clientId: string;
    redirectUri: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    createdAt: number;
};

const authorizationCodeToRequest = new Map<string, StoredAuthRequest>();

function toBase64Url(buffer: Buffer): string {
    return buffer
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function verifyPkce(codeVerifier: string, expectedChallenge: string): boolean {
    const digest = createHash("sha256").update(codeVerifier).digest();
    const challenge = toBase64Url(digest);
    return challenge === expectedChallenge;
}

// Handle both "/authorize" and "//authorize"
app.get(["/authorize", "//authorize"], (req: Request, res: Response) => {
    const {
        response_type: responseType,
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
    } = req.query as Record<string, string>;

    if (!redirectUri) {
        return res.status(400).send("missing redirect_uri");
    }
    if (responseType && responseType !== "code") {
        return res.status(400).send("unsupported response_type");
    }

    const code = toBase64Url(randomBytes(24));
    authorizationCodeToRequest.set(code, {
        clientId: clientId || "",
        redirectUri,
        codeChallenge: codeChallenge,
        codeChallengeMethod: codeChallengeMethod,
        createdAt: Date.now(),
    });

    const url = new URL(redirectUri);
    if (state) url.searchParams.set("state", state);
    url.searchParams.set("code", code);

    return res.redirect(302, url.toString());
});

app.post(
    "/token",
    // Only parse urlencoded on this route to avoid interfering with /mcp streams
    express.urlencoded({ extended: false }),
    (req: Request, res: Response) => {
        const {
            grant_type: grantType,
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
        } = (req.body || {}) as Record<string, string>;

        if (grantType !== "authorization_code") {
            return res
                .status(400)
                .json({
                    error: "unsupported_grant_type",
                    error_description:
                        "only authorization_code supported in mock",
                });
        }
        if (!code) {
            return res
                .status(400)
                .json({
                    error: "invalid_request",
                    error_description: "missing code",
                });
        }

        const stored = authorizationCodeToRequest.get(code);
        if (!stored) {
            return res
                .status(400)
                .json({
                    error: "invalid_grant",
                    error_description: "unknown or expired code",
                });
        }
        // Optional basic validation
        if (
            redirectUri &&
            stored.redirectUri &&
            stored.redirectUri !== redirectUri
        ) {
            return res
                .status(400)
                .json({
                    error: "invalid_grant",
                    error_description: "redirect_uri mismatch",
                });
        }
        if (clientId && stored.clientId && stored.clientId !== clientId) {
            return res
                .status(400)
                .json({
                    error: "invalid_client",
                    error_description: "client_id mismatch",
                });
        }
        if (stored.codeChallenge && stored.codeChallengeMethod === "S256") {
            if (
                !codeVerifier ||
                !verifyPkce(codeVerifier, stored.codeChallenge)
            ) {
                return res
                    .status(400)
                    .json({
                        error: "invalid_grant",
                        error_description: "PKCE verification failed",
                    });
            }
        }

        // Invalidate one-time code
        authorizationCodeToRequest.delete(code);

        // Issue mock tokens
        const accessToken = toBase64Url(randomBytes(32));
        const refreshToken = toBase64Url(randomBytes(32));
        return res.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 3600,
            refresh_token: refreshToken,
        });
    }
);
