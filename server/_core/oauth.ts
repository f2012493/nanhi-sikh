import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

const DEV_LOGIN_OPEN_ID = "local-dev-user";
const DEV_LOGIN_NAME = "Local Dev";

function registerDevLoginRoute(app: Express) {
  app.get("/api/dev-login", async (req: Request, res: Response) => {
    try {
      await db.upsertUser({
        openId: DEV_LOGIN_OPEN_ID,
        name: DEV_LOGIN_NAME,
        email: "dev@localhost",
        loginMethod: "dev",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(DEV_LOGIN_OPEN_ID, {
        name: DEV_LOGIN_NAME,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[DevLogin] Failed:", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
}

export function registerOAuthRoutes(app: Express) {
  if (process.env.NODE_ENV !== "production") {
    registerDevLoginRoute(app);
    console.log("[OAuth] Registered /api/dev-login (dev only)");
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
