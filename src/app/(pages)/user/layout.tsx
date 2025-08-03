"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import Sidebar from "../../../components/sidebar/index";
import styles from "./layout.module.scss";
import Nav from "../../../components/Nav/Nav";
import {sidebarUserItems} from "../../../utils/sidebar-menu"
const authorizedRoles = ["org-user"];
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) throw new Error("No token");

        // Decode the ID token to access its payload
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        // Check if the user belongs to the 'circle-admin' group
        const userGroups: string[] = decodedPayload["cognito:groups"] || [];

        const isAuthorized = userGroups.some((group) =>
          authorizedRoles.includes(group)
        );
        if (isAuthorized) {
          setIsAuthorized(true);
        } else {
          router.replace("/"); // Redirect to home if not authorized
        }
      } catch (err) {
        router.replace("/"); // Redirect to home if not authenticated
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!authChecked) return <div>Loading...</div>;

  return isAuthorized ? (
    <div className={styles.layout}>
      <Sidebar menuItems={sidebarUserItems} />
      <main className={styles.main}>
        <Nav />
        {children}
      </main>
    </div>
  ) : null;
}
