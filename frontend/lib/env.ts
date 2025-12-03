import { createEnv } from "@t3-oss/env-nextjs";
import { BUILD_ENV } from "@mocanetwork/airkit";
import { z } from "zod";

export const env = createEnv({
  // Client-side variables
  client: {
    NEXT_PUBLIC_PARTNER_ID: z.string().min(1),
    NEXT_PUBLIC_BUILD_ENV: z.enum(BUILD_ENV),
  },
  // For Next.js client-side only, specify runtimeEnv
  runtimeEnv: {
    NEXT_PUBLIC_PARTNER_ID: process.env.NEXT_PUBLIC_PARTNER_ID,
    NEXT_PUBLIC_BUILD_ENV: process.env.NEXT_PUBLIC_BUILD_ENV,
  },
});
