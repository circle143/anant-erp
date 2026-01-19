"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getTowers } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import DropdownTowerReadOnly from "@/components/Dropdown/DropdownTowerReadOnly";
import { useRouter, useSearchParams } from "next/navigation";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { tower } from "@/utils/breadcrumbs";

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
    const response = await getTowers(cursor, rera);
    console.log("response", response);

    if (!response.error && response.data?.items?.length) {
      setOrgData(response.data.items);
      setHasNextPage(response.data.pageInfo?.nextPage || false);
      setCursor(response.data.pageInfo?.cursor || null);

      if (isNext && cursor !== null) {
        setCursorStack((prev) => [...prev, cursor]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (rera) {
      fetchData(null, false);
    }
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
        <h2>Tower List</h2>
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
                    <div className={styles.details}>
                      <div>
                        <strong>Name:</strong> {org.name}
                      </div>
                      <div>
                        <strong>Floor Count:</strong> {org.floorCount}
                      </div>
                      <div>
                        <strong>Rera Number:</strong> {org.societyId}
                      </div>
                      <div>
                        <strong>Paid Amount:</strong>{" "}
                        {formatIndianCurrencyWithDecimals(org.paidAmount)}
                      </div>
                      <div>
                        <strong>Remaining:</strong>{" "}
                        {formatIndianCurrencyWithDecimals(org.remaining)}
                      </div>
                      <div>
                        <strong>Total Amount:</strong>{" "}
                        {formatIndianCurrencyWithDecimals(org.totalAmount)}
                      </div>
                      <div>
                        <strong>Created At:</strong>{" "}
                        {new Date(org.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={styles.dropdown}>
                      <DropdownTowerReadOnly
                        reraNumber={org.societyId}
                        towerId={org.id}
                      />
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