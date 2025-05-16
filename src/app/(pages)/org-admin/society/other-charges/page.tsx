"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getAllOtherCharges } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import DropDownCharges from "@/components/Dropdown/DropDownCharges";
import { useRouter, useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { other_charges } from "@/utils/breadcrumbs";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
const Page = () => {
    const [orgData, setOrgData] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [id, setId] = useState<string>("");
    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const router = useRouter();

    const fetchData = async (cursor: string | null = null, isNext = true) => {
        setLoading(true);
        if (!rera) return;
        const response = await getAllOtherCharges(rera, cursor);
        // console.log("response", response);
        // Set the updated state
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
    }, [rera]);

    const handleNext = () => fetchData(cursor);
    const handlePrevious = () => {
        if (cursorStack.length > 0) {
            const prevCursor = cursorStack[cursorStack.length - 2];
            setCursorStack((prev) => prev.slice(0, -1));
            fetchData(prevCursor, false);
        }
    };

    // Debounced handler for status change
    const debouncedStatusChange = useCallback(
        debounce((orgId: string, status: string) => {
            setSelectedStatus(status);
            setId(orgId);
        }, 300),
        []
    );

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h2>Other Charges List</h2>
                <button
                    onClick={() =>
                        router.push(
                            `/org-admin/society/other-charges/new-charges?rera=${rera}`
                        )
                    }
                >
                    New Charge
                </button>
            </div>
            <CustomBreadcrumbs items={other_charges} />
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
                                {orgData.map((org) => (
                                    <li key={org.id} className={styles.orgItem}>
                                        <div className={styles.rightSection}>
                                            <div className={styles.details}>
                                                <div>
                                                    <strong>Summary:</strong>{" "}
                                                    {org.summary}
                                                </div>

                                                <div>
                                                    <strong>Price:</strong>{" "}
                                                    {formatIndianCurrencyWithDecimals(
                                                        org.price
                                                    )}{" "}
                                                    per sqft
                                                </div>

                                                <div>
                                                    <strong>Disable:</strong>{" "}
                                                    {org.disable ? "Yes" : "No"}
                                                </div>
                                                <div>
                                                    <strong>Fixed:</strong>{" "}
                                                    {org.fixed ? "Yes" : "No"}
                                                </div>
                                                <div>
                                                    <strong>Recurring:</strong>{" "}
                                                    {org.recurring
                                                        ? "Yes"
                                                        : "No"}
                                                </div>
                                                {org.recurring && (
                                                    <div>
                                                        <strong>
                                                            Advance Months:
                                                        </strong>{" "}
                                                        {org.advanceMonths}
                                                    </div>
                                                )}

                                                <div>
                                                    <strong>Optional:</strong>{" "}
                                                    {org.optional
                                                        ? "Yes"
                                                        : "No"}
                                                </div>
                                                <div>
                                                    <strong>Created At:</strong>{" "}
                                                    {new Date(
                                                        org.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className={styles.dropdown}>
                                                <DropDownCharges
                                                    reraNumber={rera ?? ""}
                                                    id={org.id}
                                                    price={org.price}
                                                    summary={org.summary}
                                                    disable={org.disable}
                                                    fixed={org.fixed}
                                                    recurring={org.recurring}
                                                    advanceMonths={
                                                        org.advanceMonths
                                                    }
                                                    optional={org.optional}
                                                    route="other-charges"
                                                />
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
