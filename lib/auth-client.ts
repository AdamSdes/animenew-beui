"use client";

import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [usernameClient(), inferAdditionalFields<typeof auth>()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
