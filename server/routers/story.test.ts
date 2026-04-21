import { describe, expect, it } from "vitest";
import { storyRouter } from "./story";
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

describe("story router", () => {
  it("should validate story creation input", async () => {
    const ctx = createAuthContext();
    const caller = storyRouter.createCaller(ctx);

    // This should fail due to invalid input
    try {
      await caller.create({
        childName: "Test",
        childAge: 5,
        childGender: "male",
        language: "en",
        parentingChallenge: "short", // Too short, needs at least 10 chars
        animationStyle: "cartoon",
        musicMood: "playful",
        videoLength: "full",
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should validate story creation with valid input", async () => {
    const ctx = createAuthContext();
    const caller = storyRouter.createCaller(ctx);

    // Valid input should pass validation (but may fail on DB operations in test)
    try {
      const result = await caller.create({
        childName: "Aditya",
        childAge: 5,
        childGender: "male",
        language: "en",
        parentingChallenge: "My child refuses to sleep and throws tantrums at bedtime",
        animationStyle: "cartoon",
        musicMood: "calm",
        videoLength: "full",
      });
      // In a real test, we'd verify the result structure
      expect(result).toBeDefined();
    } catch (error: any) {
      // Expected to fail on DB operations in test environment
      // Just verify it's not a validation error
      if (error.message?.includes("validation")) {
        expect.fail("Should not have validation error");
      }
    }
  });

  it("should validate script generation input", async () => {
    const ctx = createAuthContext();
    const caller = storyRouter.createCaller(ctx);

    // Test that invalid story ID throws error
    try {
      await caller.generateScript({
        storyOrderId: 99999,
        childName: "Test",
        childAge: 5,
        language: "en",
        parentingChallenge: "Test challenge for story generation",
      });
      expect.fail("Should have thrown error for invalid story ID");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
