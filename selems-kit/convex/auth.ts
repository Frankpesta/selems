import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { normaliseEmail } from "./lib/validators";
import { passwordProblem } from "./lib/passwords";

// Staff sign-in: email + password, invite-only (docs/04 "Auth").
// TODO(stage 4): password reset via a one-time code emailed through Resend.

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = normaliseEmail(String(params.email ?? ""));
        const profile: { email: string } & Record<string, string> = { email };
        if (typeof params.name === "string" && params.name.trim()) profile.name = params.name.trim();
        return profile;
      },
      validatePasswordRequirements(password) {
        const problem = passwordProblem(password);
        if (problem) throw new ConvexError({ code: "INVALID_INPUT", message: problem, field: "password" });
      },
    }),
  ],
  callbacks: {
    // Runs inside the account-creation mutation, so throwing here rolls the new
    // user back: an uninvited email never gets an account.
    async afterUserCreatedOrUpdated(genericCtx, { userId, existingUserId, profile }) {
      if (existingUserId) return; // existing account signing in
      const ctx = genericCtx as unknown as MutationCtx;
      const email = normaliseEmail(String(profile.email ?? ""));
      await claimInvite(ctx, userId, email, typeof profile.name === "string" ? profile.name : undefined);
    },
  },
});

/** Turns a valid invite into a staff profile. Throws FORBIDDEN without one. */
export async function claimInvite(
  ctx: MutationCtx,
  userId: import("./_generated/dataModel").Id<"users">,
  email: string,
  name?: string,
) {
  const now = Date.now();
  const invites = await ctx.db
    .query("invites")
    .withIndex("by_email", (q) => q.eq("email", email))
    .collect();
  const invite = invites.find((i) => i.usedAt === undefined && i.expiresAt > now);
  if (!invite) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "This email hasn't been invited. Ask the hotel admin.",
    });
  }
  const existing = await ctx.db
    .query("staffProfiles")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (existing) {
    await ctx.db.patch(existing._id, { userId, role: invite.role, active: true });
  } else {
    await ctx.db.insert("staffProfiles", {
      userId,
      name: name || invite.name || email.split("@")[0],
      email,
      role: invite.role,
      active: true,
    });
  }
  await ctx.db.patch(invite._id, { usedAt: now });
}
