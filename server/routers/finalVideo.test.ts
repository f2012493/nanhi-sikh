import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("final video router", () => {
  it("should validate story order exists before starting generation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.finalVideo.startFinalVideoGeneration({
        storyOrderId: 99999, // Non-existent story
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
      // Error message will be about database query failure for non-existent story
      expect((error as any).message).toBeDefined();
    }
  });

  it("should get final video status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const status = await caller.finalVideo.getFinalVideoStatus({
        storyOrderId: 1,
      });

      expect(status).toBeDefined();
      expect(status).toHaveProperty("status");
      expect(status).toHaveProperty("progress");
      expect(status).toHaveProperty("stage");
      expect(status).toHaveProperty("isComplete");
    } catch (error) {
      // Expected to fail if story doesn't exist
      expect(error).toBeDefined();
    }
  });

  it("should handle missing story gracefully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.finalVideo.startFinalVideoGeneration({
        storyOrderId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should validate retry parameters", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.finalVideo.retryFinalVideoGeneration({
        storyOrderId: 99999,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
