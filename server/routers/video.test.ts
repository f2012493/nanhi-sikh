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

describe("video router", () => {
  it("should start video generation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const storyScript = JSON.stringify([
      {
        sceneNumber: 1,
        narration: "Once upon a time, there was a child named Arjun.",
        visualDescription: "A beautiful landscape with mountains",
        characterAction: "walking through a forest",
        hiddenLesson: "Courage comes from within",
      },
      {
        sceneNumber: 2,
        narration: "Arjun faced a challenge.",
        visualDescription: "A dark forest with mysterious shadows",
        characterAction: "standing brave",
        hiddenLesson: "Fear is just an illusion",
      },
    ]);

    const result = await caller.video.generateStoryVideo({
      storyOrderId: 1,
      childName: "Arjun",
      childAge: 5,
      language: "en",
      animationStyle: "cartoon",
      musicMood: "playful",
      storyScript,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("processing");
    expect(result.message).toContain("started");
  });

  it("should validate story script format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const invalidScript = "invalid json";

    try {
      await caller.video.generateStoryVideo({
        storyOrderId: 1,
        childName: "Arjun",
        childAge: 5,
        language: "en",
        animationStyle: "cartoon",
        musicMood: "playful",
        storyScript: invalidScript,
      });

      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should require at least one scene", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const emptyScript = JSON.stringify([]);

    try {
      await caller.video.generateStoryVideo({
        storyOrderId: 1,
        childName: "Arjun",
        childAge: 5,
        language: "en",
        animationStyle: "cartoon",
        musicMood: "playful",
        storyScript: emptyScript,
      });

      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
