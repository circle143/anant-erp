"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    getTowerFlats,
    getAllTowerSoldFlats,
    getAllTowerUnsoldFlats,
} from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
    const [orgData, setOrgData] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");

    const searchParams = useSearchParams();
    const rera = searchParams.get("rera");
    const towerID = searchParams.get("towerId");
    const router = useRouter();

    const fetchData = async (
        cursor: string | null = null,
        isNext = true,
        filter: string = "all"
    ) => {
        setLoading(true);
        if (!rera || !towerID) return;

        let response;
        if (filter === "all") {
            response = await getTowerFlats(cursor || "", rera, towerID);
        } else if (filter === "sold") {
            response = await getAllTowerSoldFlats(cursor || "", rera, towerID);
        } else if (filter === "unsold") {
            response = await getAllTowerUnsoldFlats(
                cursor || "",
                rera,
                towerID
            );
        } else {
            console.error("Invalid filter:", filter);
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
        fetchData(null, false, selectedFilter);
    }, [rera, towerID, selectedFilter]);

    const handleNext = () => fetchData(cursor, true, selectedFilter);

    const handlePrevious = () => {
        if (cursorStack.length > 1) {
            const prevCursor = cursorStack[cursorStack.length - 2];
            setCursorStack((prev) => prev.slice(0, -1));
            fetchData(prevCursor, false, selectedFilter);
        }
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

    return (
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2>Flat List</h2>
          <div className={styles.actions}>
            <select
              className={styles.selectFilter}
              onChange={handleFilterChange}
              defaultValue="all"
            >
              <option value="all">All</option>
              <option value="sold">Sold</option>
              <option value="unsold">Unsold</option>
            </select>
            <button
              className={styles.newFlatButton}
              onClick={() =>
                router.push(
                  `/org-admin/society/tower/flat/new-flat?rera=${rera}&towerId=${towerID}`
                )
              }
            >
              New Flat
            </button>
          </div>
        </div>

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
                            <strong>Name:</strong> {org.name}
                          </div>
                          <div>
                            <strong>id:</strong> {org.id}
                          </div>
                          <div>
                            <strong>Floor:</strong> {org.floorNumber}
                          </div>
                          <div>
                            <strong>Flat Status:</strong> {org.soldBy}
                          </div>
                          <div>
                            <strong>Created At:</strong>{" "}
                            {new Date(org.createdAt).toLocaleString()}
                          </div>
                        </div>
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
