"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    getTowerPaymentPlans,
    markPaymentPlanActiveForTower,
} from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
const Page = () => {
    const [orgData, setOrgData] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(
        null
    );
    const [activatingId, setActivatingId] = useState<string | null>(null); // 🔄 For individual button loading

    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const towerID = searchParams.get("towerId");
    const router = useRouter();

    const fetchData = async (cursor: string | null = null, isNext = true) => {
        setLoading(true);
        if (!rera || !towerID) return;
        const response = await getTowerPaymentPlans(
            rera,
            towerID,
            cursor || ""
        );
        setOrgData(response.data.items);
        setHasNextPage(response.data.pageInfo.nextPage);
        setCursor(response.data.pageInfo.cursor);
        if (isNext && cursor !== null) {
            setCursorStack((prev) => [...prev, cursor]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(null, false);
    }, [rera, towerID, selectedFilter, cursorStack]);

    const handleNext = () => {
        if (cursor) {
            setCursorStack((prev) => [...prev, cursor]);
        }
        fetchData(cursor, true);
    };

    const handlePrevious = () => {
        if (cursorStack.length > 0) {
            const prevCursor = cursorStack[cursorStack.length - 2];
            setCursorStack((prev) => prev.slice(0, -1));
            fetchData(prevCursor, false);
        }
    };

    const toggleOwnerDetails = (index: number) => {
        setExpandedOwnerIndex((prevIndex) =>
            prevIndex === index ? null : index
        );
    };

    const debouncedFilterChange = useCallback(
        debounce((value: string) => {
            setCursor(null);
            setCursorStack([]);
            setSelectedFilter(value);
        }, 300),
        []
    );

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        debouncedFilterChange(value);
    };

    const handleActivate = async (paymentId: string) => {
        if (!rera || !towerID) return;
        setActivatingId(paymentId);
        const res = await markPaymentPlanActiveForTower(
            rera,
            towerID,
            paymentId
        );
        setActivatingId(null);

        if (!res.error) {
            fetchData(cursor, false); // Refresh the list after activation
        } else {
            alert("Failed to activate payment plan");
        }
    };
    const payment_plan = [
        { name: "Home", href: "/org-admin" },
        { name: "Societies", href: "/org-admin/society" },
        { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
        { name: "Payment Plan" },
    ];
    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h2>Payment Plan List</h2>
            </div>
            <CustomBreadcrumbs items={payment_plan} />
            {loading ? (
                <div className={styles.loading}>
                    <Loader />
                </div>
            ) : (
                <>
                    {orgData.length === 0 ? (
                        <div className={styles.noData}>No data available</div>
                    ) : (
                        <>
                            <ul className={styles.orgList}>
                                {orgData.map((plan, index) => (
                                    <li
                                        key={plan.id}
                                        className={styles.orgItem}
                                    >
                                        <div className={styles.details}>
                                            <div>
                                                <strong>Plan Summary:</strong>{" "}
                                                {plan.summary}
                                            </div>
                                            <div>
                                                <strong>Amount:</strong>{" "}
                                                {plan.amount}%
                                            </div>
                                            <div>
                                                <strong>Condition Type:</strong>{" "}
                                                {plan.conditionType}
                                            </div>
                                            <div>
                                                <strong>
                                                    Condition Value:
                                                </strong>{" "}
                                                {plan.conditionValue !==
                                                    undefined &&
                                                plan.conditionValue !== null
                                                    ? plan.conditionValue
                                                    : "Not Available"}
                                            </div>
                                            <div>
                                                <strong>Scope:</strong>{" "}
                                                {plan.scope}
                                            </div>
                                            <div>
                                                <strong>Active:</strong>{" "}
                                                {plan.active ? "Yes" : "No"}
                                            </div>
                                            <div>
                                                <strong>Created At:</strong>{" "}
                                                {plan.createdAt
                                                    ? new Date(
                                                          plan.createdAt
                                                      ).toLocaleString()
                                                    : "Not Available"}
                                            </div>

                                            <div
                                                className={
                                                    styles.actionButtonWrapper
                                                }
                                            >
                                                {plan.active ? (
                                                    <button
                                                        className={
                                                            styles.deactivateBtn
                                                        }
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={
                                                            styles.activateBtn
                                                        }
                                                        onClick={() =>
                                                            handleActivate(
                                                                plan.id
                                                            )
                                                        }
                                                        disabled={
                                                            activatingId ===
                                                            plan.id
                                                        }
                                                    >
                                                        {activatingId ===
                                                        plan.id
                                                            ? "Activating..."
                                                            : "Activate"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.paginationControls}>
                                <button
                                    onClick={handlePrevious}
                                    disabled={cursorStack.length <= 0}
                                    className={styles.navButton}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!hasNextPage}
                                    className={styles.navButton}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Page;
