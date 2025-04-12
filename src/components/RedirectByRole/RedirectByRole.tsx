// components/RedirectByRole.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

const roleRoutes: Record<string, string> = {
  "circle-admin": "/admin",
  "org-admin": "/org-admin",
  "org-user": "/user",
};

export default function RedirectByRole({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectIfOnRoot = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;

        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        const userGroups: string[] = decodedPayload["cognito:groups"] || [];

        const matchedGroup = userGroups.find((group) =>
          Object.keys(roleRoutes).includes(group)
        );

        if (matchedGroup && pathname === "/") {
          router.replace(roleRoutes[matchedGroup]);
        }
      } catch (error) {
        // Do nothing if not authenticated — let normal auth/layout handle it
      }
    };

    redirectIfOnRoot();
  }, [router, pathname]);

  return <>{children}</>;
}
