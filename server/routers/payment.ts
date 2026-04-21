import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getStoryOrderById, updateStoryOrder } from "../db";
import crypto from "crypto";

// Razorpay pricing tiers in INR (GST-inclusive)
const PRICING_TIERS = {
  preview: {
    name: "Preview (Watermarked)",
    price: 99, // ₹99 GST-inclusive
    description: "Watermarked video for preview",
  },
  hd: {
    name: "HD Quality",
    price: 299, // ₹299 GST-inclusive
    description: "Full HD video, no watermark",
  },
  hd_whatsapp: {
    name: "HD + WhatsApp Delivery",
    price: 399, // ₹399 GST-inclusive
    description: "HD video + direct WhatsApp delivery",
  },
};

export const paymentRouter = router({
  /**
   * Get available pricing tiers
   */
  getPricingTiers: protectedProcedure.query(() => {
    return PRICING_TIERS;
  }),

  /**
   * Create Razorpay order for story
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        pricingTier: z.enum(["preview", "hd", "hd_whatsapp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const tierInfo = PRICING_TIERS[input.pricingTier];
      if (!tierInfo) {
        throw new Error("Invalid pricing tier");
      }

      // TODO: Call Razorpay API to create order
      // For now, return mock order details
      const razorpayOrderId = `order_${Date.now()}`;

      // Update story with payment info
      await updateStoryOrder(input.storyOrderId, {
        pricingTier: input.pricingTier,
        amountPaid: tierInfo.price,
        razorpayOrderId,
        paymentStatus: "pending",
      });

      return {
        razorpayOrderId,
        amount: tierInfo.price,
        currency: "INR",
        description: tierInfo.description,
        customerName: ctx.user.name,
        customerEmail: ctx.user.email,
      };
    }),

  /**
   * Verify Razorpay payment signature
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // TODO: Verify signature with Razorpay secret
      // const secret = process.env.RAZORPAY_KEY_SECRET;
      // const body = input.razorpayOrderId + "|" + input.razorpayPaymentId;
      // const expectedSignature = crypto
      //   .createHmac("sha256", secret!)
      //   .update(body)
      //   .digest("hex");
      // if (expectedSignature !== input.razorpaySignature) {
      //   throw new Error("Invalid signature");
      // }

      // Update story with payment confirmation
      await updateStoryOrder(input.storyOrderId, {
        razorpayPaymentId: input.razorpayPaymentId,
        paymentStatus: "completed",
        renderStatus: "generating_script",
      });

      return { success: true };
    }),

  /**
   * Get payment status for a story
   */
  getPaymentStatus: protectedProcedure
    .input(z.object({ storyOrderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return {
        paymentStatus: story.paymentStatus,
        pricingTier: story.pricingTier,
        amountPaid: story.amountPaid,
        razorpayOrderId: story.razorpayOrderId,
        razorpayPaymentId: story.razorpayPaymentId,
      };
    }),
});
