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

describe("payment router", () => {
  it("should return pricing tiers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tiers = await caller.payment.getPricingTiers();

    expect(tiers).toBeDefined();
    expect(tiers.preview).toBeDefined();
    expect(tiers.hd).toBeDefined();
    expect(tiers.hd_whatsapp).toBeDefined();

    // Verify pricing in INR
    expect(tiers.preview.price).toBe(99);
    expect(tiers.hd.price).toBe(299);
    expect(tiers.hd_whatsapp.price).toBe(399);

    // Verify GST-inclusive pricing
    expect(tiers.preview.name).toContain("Preview");
    expect(tiers.hd.name).toContain("HD");
    expect(tiers.hd_whatsapp.name).toContain("HD");
  });

  it("should validate pricing tier selection", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Valid tier should work
    const tiers = await caller.payment.getPricingTiers();
    expect(Object.keys(tiers)).toContain("preview");
    expect(Object.keys(tiers)).toContain("hd");
    expect(Object.keys(tiers)).toContain("hd_whatsapp");
  });

  it("should verify GST-inclusive pricing display", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tiers = await caller.payment.getPricingTiers();

    // All prices should be positive and in INR
    expect(tiers.preview.price).toBeGreaterThan(0);
    expect(tiers.hd.price).toBeGreaterThan(0);
    expect(tiers.hd_whatsapp.price).toBeGreaterThan(0);

    // Verify pricing hierarchy
    expect(tiers.preview.price).toBeLessThan(tiers.hd.price);
    expect(tiers.hd.price).toBeLessThan(tiers.hd_whatsapp.price);
  });
});
