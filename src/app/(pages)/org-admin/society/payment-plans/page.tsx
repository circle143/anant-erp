"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getPaymentPlans } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { payment_plan } from "@/utils/breadcrumbs";
const Page = () => {
    const [orgData, setOrgData] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const router = useRouter();

    const fetchData = async (cursor: string | null = null, isNext = true) => {
        setLoading(true);
        if (!rera) return;
        const response = await getPaymentPlans(rera, cursor);

        setOrgData(response.data.items || []);
        console.log(response.data.items)
        setHasNextPage(response.data.pageInfo?.nextPage || false);
        setCursor(response.data.pageInfo?.cursor || null);

        if (isNext && cursor !== null) {
            setCursorStack((prev) => [...prev, cursor]);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData(null, false);
    }, [rera]);

    const handleNext = () => fetchData(cursor);
    const handlePrevious = () => {
        if (cursorStack.length > 0) {
            const prevCursor = cursorStack[cursorStack.length - 2];
            setCursorStack((prev) => prev.slice(0, -1));
            fetchData(prevCursor, false);
        }
    };

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h2>Payment Plan List</h2>
                <button
                    onClick={() =>
                        router.push(
                            `/org-admin/society/payment-plans/new-payment-plan?rera=${rera}`
                        )
                    }
                >
                    New Payment Plan
                </button>
            </div>
            <CustomBreadcrumbs items={payment_plan} />
            {loading ? (
                <div className={styles.loading}>
                    <Loader />
                </div>
            ) : orgData.length === 0 ? (
                <div className={styles.noData}>No data available</div>
            ) : (
                <>
                    <ul className={styles.orgList}>
                        {orgData.map((org) => (
                            <li key={org.id} className={styles.orgItem}>
                                <div className={styles.rightSection}>
                                    <div className={styles.details}>
                                        <div><strong>Name:</strong> {org.name}</div>
                                        <div><strong>Abbreviation:</strong> {org.abbr}</div>

                                        <div>
                                            <strong>Ratios:</strong>
                                            {org.ratios?.length > 0 ? (
                                                <ul className={styles.ratioList}>
                                                    {org.ratios.map(
                                                        (
                                                            ratioObj: {
                                                                id: string;
                                                                ratio: string;
                                                                items: Array<{
                                                                    id: string;
                                                                    conditionType: string;
                                                                    conditionValue: string | null;
                                                                    ratio: string;
                                                                    scope: string;
                                                                }>;
                                                            },
                                                        ) => (
                                                            <li key={ratioObj.id} className={styles.ratioItem}>
                                                                <div>
                                                                    <strong>Group Ratio:</strong>{" "}
                                                                    {ratioObj.ratio.split(",").map(r => parseFloat(r)).join(":")}
                                                                </div>
                                                                <ul className={styles.itemList}>
                                                                    {ratioObj.items.map((item) => (
                                                                        <li key={item.id} className={styles.item}>
                                                                            <div>
                                                                                <strong>Condition Type:</strong> {item.conditionType}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Condition Value:</strong>{" "}
                                                                                {item.conditionValue ? item.conditionValue + " days" : "N/A"}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Ratio:</strong> {parseFloat(item.ratio)}
                                                                            </div>
                                                                            <div>
                                                                                <strong>Scope:</strong> {item.scope}
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>

                                            ) : (
                                                <div>No ratios available</div>
                                            )}
                                        </div>
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
        </div>
    );
};

export default Page;
