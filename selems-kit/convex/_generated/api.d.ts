/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as booking from "../booking.js";
import type * as devTools from "../devTools.js";
import type * as emailData from "../emailData.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_availability from "../lib/availability.js";
import type * as lib_bookings from "../lib/bookings.js";
import type * as lib_content from "../lib/content.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_passwords from "../lib/passwords.js";
import type * as lib_pricing from "../lib/pricing.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as lib_refs from "../lib/refs.js";
import type * as lib_stays from "../lib/stays.js";
import type * as lib_turnstile from "../lib/turnstile.js";
import type * as lib_validators from "../lib/validators.js";
import type * as public_booking from "../public/booking.js";
import type * as public_content from "../public/content.js";
import type * as public_inquiries from "../public/inquiries.js";
import type * as public_rooms from "../public/rooms.js";
import type * as revalidate from "../revalidate.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  booking: typeof booking;
  devTools: typeof devTools;
  emailData: typeof emailData;
  emails: typeof emails;
  http: typeof http;
  inquiries: typeof inquiries;
  "lib/auth": typeof lib_auth;
  "lib/availability": typeof lib_availability;
  "lib/bookings": typeof lib_bookings;
  "lib/content": typeof lib_content;
  "lib/email": typeof lib_email;
  "lib/errors": typeof lib_errors;
  "lib/images": typeof lib_images;
  "lib/passwords": typeof lib_passwords;
  "lib/pricing": typeof lib_pricing;
  "lib/rateLimits": typeof lib_rateLimits;
  "lib/refs": typeof lib_refs;
  "lib/stays": typeof lib_stays;
  "lib/turnstile": typeof lib_turnstile;
  "lib/validators": typeof lib_validators;
  "public/booking": typeof public_booking;
  "public/content": typeof public_content;
  "public/inquiries": typeof public_inquiries;
  "public/rooms": typeof public_rooms;
  revalidate: typeof revalidate;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
