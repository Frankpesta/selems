import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { currentStaff } from "./lib/auth";
import { isValidEmail, normaliseEmail } from "./lib/validators";
import { appError } from "./lib/errors";

const INVITE_DAYS = 7;

/**
 * Creates an admin invite for the first admin. Run from the CLI:
 *   npx convex run users:bootstrapAdmin '{"email":"…","name":"…"}'
 * That person then signs up at /admin/login?mode=signup.
 */
export const bootstrapAdmin = internalMutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = normaliseEmail(args.email);
    if (!isValidEmail(email)) throw appError("INVALID_INPUT", "Enter a valid email address.", "email");

    const profile = await ctx.db
      .query("staffProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (profile) return { status: "already_staff" as const, role: profile.role };

    const now = Date.now();
    const expiresAt = now + INVITE_DAYS * 86_400_000;
    const invites = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const open = invites.find((i) => i.usedAt === undefined && i.expiresAt > now);
    if (open) {
      await ctx.db.patch(open._id, { role: "admin", expiresAt, name: args.name ?? open.name });
      return { status: "invite_renewed" as const, expiresAt };
    }
    await ctx.db.insert("invites", { email, name: args.name, role: "admin", expiresAt });
    return { status: "invite_created" as const, expiresAt };
  },
});

/** The signed-in staff member, or null. Used by the admin shell. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const staff = await currentStaff(ctx);
    if (!staff) return null;
    return { name: staff.name, email: staff.email, role: staff.role };
  },
});
