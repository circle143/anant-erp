"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getAllSocietyBanks } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { Banks } from "@/utils/breadcrumbs";
import DropDownBroker from "@/components/Dropdown/DropDownBroker";

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
        const response = await getAllSocietyBanks(rera, cursor);
        // console.log("response", response);

        if (response?.error) {
            setOrgData([]);
            setHasNextPage(false);
            setCursor(null);
            setLoading(false);
            return;
        }

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
                <h2>Bank List</h2>
                <button
                    onClick={() =>
                        router.push(
                            `/org-admin/society/banks/new-bank?rera=${rera}`
                        )
                    }
                >
                    New bank
                </button>
            </div>
            <CustomBreadcrumbs items={Banks} />
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
                                {orgData.map((bank) => (
                                    <li
                                        key={bank.id}
                                        className={styles.orgItem}
                                    >
                                        <div className={styles.rightSection}>
                                            <div className={styles.details}>
                                                <div>
                                                    <strong>Name:</strong>{" "}
                                                    {bank.name}
                                                </div>

                                                <div>
                                                    <strong>
                                                        Account Number:
                                                    </strong>{" "}
                                                    {bank.accountNumber}
                                                </div>
                                                <div>
                                                    <strong>Created At:</strong>{" "}
                                                    {new Date(
                                                        bank.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className={styles.dropdown}>
                                                <DropDownBroker
                                                    reraNumber={rera ?? ""}
                                                    id={bank.id}
                                                    name={bank.name}
                                                    accountNumber={
                                                        bank.accountNumber
                                                    }
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
