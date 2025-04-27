"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getOrg, updateStatus } from "@/redux/action/admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { OrganizationStatus } from "../../../utils/routes/organization/types";

const Page = () => {
    const [orgData, setOrgData] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [editingOrgId, setEditingOrgId] = useState<string>("");

    const fetchData = async (cursor: string | null = null, isNext = true) => {
        setLoading(true);
        try {
            const response = await getOrg(cursor);
            if (!response.error) {
                setOrgData(response.data.items);
                setHasNextPage(response.data.pageInfo.nextPage);
                setCursor(response.data.pageInfo.cursor);

                if (isNext && cursor) {
                    setCursorStack((prev) => [...prev, cursor]);
                }
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(null, false);
    }, []);

    const handleNext = () => {
        if (cursor) {
            fetchData(cursor, true);
        }
    };

    const handlePrevious = () => {
        if (cursorStack.length > 1) {
            const prevCursor = cursorStack[cursorStack.length - 2];
            setCursorStack((prev) => prev.slice(0, -1));
            fetchData(prevCursor, false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setSelectedStatus("");
        setEditingOrgId("");
    };

    const handleStatusClick = (orgId: string, currentStatus: string) => {
        setEditingId(orgId);
        setSelectedStatus(currentStatus);
        setEditingOrgId(orgId);
    };

    const debouncedStatusChange = useCallback(
        debounce((status: string) => {
            setSelectedStatus(status);
        }, 300),
        []
    );

    const handleStatusChange = (status: string) => {
        debouncedStatusChange(status);
    };

    const handleStatusDone = async () => {
        if (
            editingOrgId &&
            Object.values(OrganizationStatus).includes(
                selectedStatus as OrganizationStatus
            )
        ) {
            try {
                const response = await updateStatus(
                    editingOrgId,
                    selectedStatus as OrganizationStatus
                );
                if (!response.error) {
                    await fetchData(cursor, false); // reload current page data
                }
            } catch (error) {
                console.error("Error updating status:", error);
            } finally {
                handleCancelEdit();
            }
        } else {
            console.error("Invalid status selected:", selectedStatus);
        }
    };

    return (
        <div className={`container ${styles.container}`}>
            <h2>Organization List</h2>

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
                                        <div className={styles.logoContainer}>
                                            {org.logo ? (
                                                <img
                                                    src={org.logo}
                                                    alt={`${org.name} logo`}
                                                    className={styles.logo}
                                                />
                                            ) : (
                                                <div className={styles.noLogo}>
                                                    No Logo
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.rightSection}>
                                            <div className={styles.details}>
                                                <div>
                                                    <strong>Name:</strong>{" "}
                                                    {org.name}
                                                </div>
                                                <div>
                                                    <strong>Created At:</strong>{" "}
                                                    {new Date(
                                                        org.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                                <div>
                                                    <strong>GST:</strong>{" "}
                                                    {org.gst || "N/A"}
                                                </div>
                                                <div>
                                                    <strong>Status:</strong>{" "}
                                                    {editingId === org.id ? (
                                                        <select
                                                            value={
                                                                selectedStatus
                                                            }
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className={
                                                                styles.statusDropdown
                                                            }
                                                        >
                                                            <option
                                                                value={
                                                                    OrganizationStatus.ACTIVE
                                                                }
                                                            >
                                                                Active
                                                            </option>
                                                            <option
                                                                value={
                                                                    OrganizationStatus.INACTIVE
                                                                }
                                                            >
                                                                Inactive
                                                            </option>
                                                            <option
                                                                value={
                                                                    OrganizationStatus.ARCHIVE
                                                                }
                                                            >
                                                                Archive
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        org.status
                                                    )}
                                                </div>
                                            </div>

                                            {editingId === org.id ? (
                                                <div
                                                    className={
                                                        styles.editButtons
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.updateButton
                                                        }
                                                        onClick={
                                                            handleStatusDone
                                                        }
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        className={
                                                            styles.cancelButton
                                                        }
                                                        onClick={
                                                            handleCancelEdit
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className={
                                                        styles.updateButton
                                                    }
                                                    onClick={() =>
                                                        handleStatusClick(
                                                            org.id,
                                                            org.status
                                                        )
                                                    }
                                                >
                                                    Update Status
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.paginationControls}>
                                <button
                                    onClick={handlePrevious}
                                    disabled={cursorStack.length <= 1}
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
