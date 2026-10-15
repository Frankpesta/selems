"use node";

import { v } from "convex/values";
import type { ReactElement } from "react";
import { render } from "react-email";
import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { emailDisabled, emailFrom, resend, siteUrl } from "./lib/email";
import { BookingConfirmation } from "../emails/BookingConfirmation";
import { StaffNewBooking } from "../emails/StaffNewBooking";
import { BookingCancelled } from "../emails/BookingCancelled";
import { StaffNewInquiry } from "../emails/StaffNewInquiry";
import { formatPhone } from "../lib/format";

// Transactional booking emails (docs/04). React Email needs Node, so rendering
// happens here; queueing, retries and delivery tracking are the Resend component's.

async function send(
  ctx: ActionCtx,
  opts: {
    bookingId: Id<"bookings">;
    to: string[];
    replyTo: string;
    subject: string;
    element: ReactElement;
    label: string;
    idempotencyKey: string;
  },
) {
  if (opts.to.length === 0) return;
  if (emailDisabled()) {
    console.log(`[email skipped: no Resend key] ${opts.subject} → ${opts.to.length} recipient(s)`);
    await ctx.runMutation(internal.emailData.logEmail, {
      bookingId: opts.bookingId,
      message: `${opts.label} not sent: email is not configured yet.`,
      sent: false,
    });
    return;
  }
  const html = await render(opts.element);
  const text = await render(opts.element, { plainText: true });
  await resend.sendEmail(ctx, {
    from: emailFrom(),
    to: opts.to,
    replyTo: [opts.replyTo],
    subject: opts.subject,
    html,
    text,
    idempotencyKey: opts.idempotencyKey,
  });
  await ctx.runMutation(internal.emailData.logEmail, {
    bookingId: opts.bookingId,
    message: `${opts.label} emailed to ${opts.to.join(", ")}.`,
    sent: true,
  });
}

export const bookingConfirmation = internalAction({
  args: { bookingId: v.id("bookings"), token: v.string() },
  handler: async (ctx, { bookingId, token }) => {
    const data = await ctx.runQuery(internal.emailData.bookingEmail, { bookingId });
    if (!data) return;
    const m = { ...data.model, manageUrl: `${siteUrl()}/booking/${data.model.ref}?t=${encodeURIComponent(token)}` };
    await send(ctx, {
      bookingId,
      to: [data.guestEmail],
      replyTo: data.replyTo,
      subject: `Booking confirmed: ${m.roomName}, ${m.checkIn} (${m.ref})`,
      element: <BookingConfirmation m={m} />,
      label: "Confirmation",
      idempotencyKey: `confirmation:${bookingId}`,
    });
  },
});

export const staffNewBooking = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const data = await ctx.runQuery(internal.emailData.bookingEmail, { bookingId });
    if (!data) return;
    await send(ctx, {
      bookingId,
      to: data.staff,
      replyTo: data.model.guestEmail,
      subject: `New booking ${data.model.ref}: ${data.model.roomName}, ${data.model.checkIn}`,
      element: <StaffNewBooking m={data.model} />,
      label: "Front-desk alert",
      idempotencyKey: `staff-new:${bookingId}`,
    });
  },
});

export const bookingCancelled = internalAction({
  args: { bookingId: v.id("bookings"), by: v.union(v.literal("guest"), v.literal("staff")) },
  handler: async (ctx, { bookingId }) => {
    const data = await ctx.runQuery(internal.emailData.bookingEmail, { bookingId });
    if (!data) return;
    await send(ctx, {
      bookingId,
      to: [data.guestEmail],
      replyTo: data.replyTo,
      subject: `Booking cancelled (${data.model.ref})`,
      element: <BookingCancelled m={data.model} audience="guest" />,
      label: "Cancellation",
      idempotencyKey: `cancelled-guest:${bookingId}`,
    });
    await send(ctx, {
      bookingId,
      to: data.staff,
      replyTo: data.model.guestEmail,
      subject: `Cancelled: ${data.model.ref}, ${data.model.roomName}, ${data.model.checkIn}`,
      element: <BookingCancelled m={data.model} audience="staff" />,
      label: "Front-desk cancellation alert",
      idempotencyKey: `cancelled-staff:${bookingId}`,
    });
  },
});

const SUBJECTS: Record<string, string> = {
  reservation: "Reservation enquiry",
  group: "Group or event booking",
  request: "Request",
  suggestion: "Suggestion",
  testimony: "Testimony",
  complaint: "Complaint",
};

const received = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export const staffNewInquiry = internalAction({
  args: { inquiryId: v.id("inquiries") },
  handler: async (ctx, { inquiryId }) => {
    const data = await ctx.runQuery(internal.inquiries.forEmail, { inquiryId });
    if (!data || data.staff.length === 0) return;
    const { inquiry } = data;
    const subject = SUBJECTS[inquiry.subject] ?? inquiry.subject;
    if (emailDisabled()) {
      console.log(`[email skipped: no Resend key] inquiry from ${inquiry.name}`);
      return;
    }
    const element = (
      <StaffNewInquiry
        m={{
          hotelName: data.hotelName,
          logoUrl: data.logoUrl,
          adminUrl: data.adminUrl,
          subject,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone ? formatPhone(inquiry.phone) : null,
          message: inquiry.message,
          receivedAt: received.format(inquiry.createdAt),
        }}
      />
    );
    await resend.sendEmail(ctx, {
      from: emailFrom(),
      to: data.staff,
      replyTo: [inquiry.email],
      subject: `${subject}: ${inquiry.name}`,
      html: await render(element),
      text: await render(element, { plainText: true }),
      idempotencyKey: `inquiry:${inquiryId}`,
    });
  },
});
