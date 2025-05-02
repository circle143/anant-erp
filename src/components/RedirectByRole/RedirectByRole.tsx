"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import Loader from "../Loader/Loader";
const roleRoutes: Record<string, string> = {
  "circle-admin": "/admin/dashboard",
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
  const [loading, setLoading] = useState(true); // loading state

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
        console.error("Redirect error:", error);
      } finally {
        setLoading(false); // Stop loading in any case
      }
    };

    redirectIfOnRoot();
  }, [router, pathname]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
