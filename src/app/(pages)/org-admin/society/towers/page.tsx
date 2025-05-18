"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getTowers } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import DropdownTower from "@/components/Dropdown/DropdownTower";
import { useRouter, useSearchParams } from "next/navigation";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { tower } from "@/utils/breadcrumbs";
import { useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { updateTowerFlats } from "@/redux/slice/flatSlice";
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
    const dispatch = useDispatch();

    const fetchData = async (cursor: string | null = null, isNext = true) => {
        setLoading(true);
        if (!rera) return;

        const response = await getTowers(cursor, rera);

        const towers = response.data.items;
        setOrgData(towers);
        setHasNextPage(response.data.pageInfo.nextPage);
        setCursor(response.data.pageInfo.cursor);

        // Store each tower's flat data in Redux
        towers.forEach((tower: any) => {
            dispatch(
                updateTowerFlats({
                    towerId: tower.id,
                    data: {
                        totalFlats: tower.totalFlats,
                        totalSoldFlats: tower.soldFlats,
                        totalUnsoldFlats: tower.unsoldFlats,
                    },
                })
            );
        });

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
                <h2>Tower List</h2>

                <button
                    onClick={() =>
                        router.push(
                            `/org-admin/society/towers/new-tower?rera=${rera}`
                        )
                    }
                >
                    New Tower
                </button>
            </div>
            <CustomBreadcrumbs items={tower} />
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
                                        {/* <div className={styles.logoContainer}>
              {org.coverPhoto ? (
                <img
                  src={org.coverPhoto}
                  alt={`${org.coverPhoto} logo`}
                  className={styles.logo}
                />
              ) : (
                <div className={styles.noLogo}>No Logo</div>
              )}
            </div> */}
                                        <div className={styles.rightSection}>
                                            <div className={styles.details}>
                                                <div>
                                                    <strong>Name:</strong>{" "}
                                                    {org.name}
                                                </div>
                                                {/* <div>
              <strong>GST:</strong> {org.gst || "N/A"}
            </div> */}
                                                <div>
                                                    {" "}
                                                    <strong>
                                                        Floor Count:
                                                    </strong>{" "}
                                                    {org.floorCount}
                                                </div>
                                                <div>
                                                    {" "}
                                                    <strong>
                                                        Rera Number:
                                                    </strong>{" "}
                                                    {org.societyId}
                                                </div>
                                                <div>
                                                    {" "}
                                                    <strong>
                                                        Paid Amount:
                                                    </strong>{" "}
                                                    {formatIndianCurrencyWithDecimals(
                                                        org.paidAmount
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>Remaining:</strong>{" "}
                                                    {formatIndianCurrencyWithDecimals(
                                                        org.remaining
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Total Amount:
                                                    </strong>{" "}
                                                    {formatIndianCurrencyWithDecimals(
                                                        org.totalAmount
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>Created At:</strong>{" "}
                                                    {new Date(
                                                        org.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={styles.dropdown}>
                                                <DropdownTower
                                                    reraNumber={org.societyId}
                                                    towerId={org.id}
                                                />
                                            </div>
                                            {/* {editingId === org.id ? (
              <div className={styles.editButtons}>
                <button
                  className={styles.updateButton}
                  onClick={handleStatusDone}
                >
                  Done
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className={styles.updateButton}
                onClick={() => handleStatusClick(org.id, org.status)}
              >
                Update Status
              </button>
            )} */}
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
