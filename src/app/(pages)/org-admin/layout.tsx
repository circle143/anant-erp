"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import Sidebar from "../../../components/sidebar/index";
import styles from "./layout.module.scss";
import Nav from "../../../components/Nav/Nav";
import { sidebarOrgAdminItems } from "../../../utils/sidebar-menu";
import Loader from "@/components/Loader/Loader";
import { getSelf } from "@/redux/action/org-admin";
import { getUrl } from "aws-amplify/storage";
import { useDispatch } from "react-redux";
import { updateSelf } from "@/redux/slice/selfSlice";

const authorizedRoles = ["org-admin"];

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const fetchSelf = async () => {
        const res = await getSelf();
        if (!res?.error && res?.data) {
            const item = res.data;
            if (item.logo) {
                try {
                    const getUrlResult = await getUrl({
                        path: item.logo,
                        options: {
                            validateObjectExistence: true,
                            expiresIn: 3600,
                        },
                    });
                    item.logo = getUrlResult.url.toString();
                } catch (error) {
                    console.error("Error fetching logo URL", error);
                }
            }

            // ✅ Update redux store instead of local state
            dispatch(
                updateSelf({
                    name: item.name || "",
                    gst: item.gst || "",
                    logo: item.logo || "",
                    file: null,
                })
            );
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();

                if (!token) throw new Error("No token");

                const payloadBase64 = token.split(".")[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));

                const userGroups: string[] =
                    decodedPayload["cognito:groups"] || [];

                const isAuthorized = userGroups.some((group) =>
                    authorizedRoles.includes(group)
                );

                if (isAuthorized) {
                    setIsAuthorized(true);
                } else {
                    router.replace("/");
                }
            } catch (err) {
                router.replace("/");
            } finally {
                setAuthChecked(true);
            }
        };

        checkAuth();
        fetchSelf();
    }, [router]);

    if (!authChecked) return <Loader />;

    return isAuthorized ? (
        <div className={styles.layout}>
            <Sidebar menuItems={sidebarOrgAdminItems} />
            <main className={styles.main}>
                <Nav />
                {children}
            </main>
        </div>
    ) : null;
}
