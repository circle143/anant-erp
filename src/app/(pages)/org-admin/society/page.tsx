"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getSocieties } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { getUrl, uploadData } from "aws-amplify/storage";
import DropdownMenu from "@/components/Dropdown/DropdownMenu";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { society } from "@/utils/breadcrumbs";
const Page = () => {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [id, setId] = useState<string>("");
  interface SocietyItem {
    name: string;
    reraNumber: string;
    address: string;
    orgId: string;
    coverPhoto: string;
    createdAt: string;
    updatedAt: string;
  }
  const fetchData = async (cursor: string | null = null, isNext = true) => {
    setLoading(true);
    const response = await getSocieties(cursor);
    console.log("response", response);
    if (!response.error && response.data?.items?.length) {
      // Replace coverPhoto with signed URL
      const updatedItems = await Promise.all(
        response.data.items.map(async (item: SocietyItem) => {
          if (item.coverPhoto) {
            try {
              const getUrlResult = await getUrl({
                path: item.coverPhoto,
                options: {
                  validateObjectExistence: true,
                  expiresIn: 3600,
                },
              });

              return {
                ...item,
                coverPhoto: getUrlResult.url.toString(),
              };
            } catch (error) {
              console.error("Failed to fetch image URL for:", item.coverPhoto);
              return item; // Fallback to original item
            }
          } else {
            return item; // No coverPhoto to replace
          }
        })
      );
      setOrgData(updatedItems);
      setHasNextPage(response.data.pageInfo.nextPage);
      setCursor(response.data.pageInfo.cursor);

      if (isNext && cursor !== null) {
        setCursorStack((prev) => [...prev, cursor]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData(null, false);
  }, []);

  const handleNext = () => fetchData(cursor);
  const handlePrevious = () => {
    if (cursorStack.length > 1) {
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
      <h2>Societies List</h2>
      <CustomBreadcrumbs items={society} />
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
                {orgData.map((org, index) => (
                  <li key={org.id || index} className={styles.orgItem}>
                    <div className={styles.logoContainer}>
                      {org.coverPhoto ? (
                        <img
                          loading="lazy"
                          src={org.coverPhoto}
                          alt={`${org.coverPhoto} logo`}
                          className={styles.logo}
                        />
                      ) : (
                        <div className={styles.noLogo}>No Logo</div>
                      )}
                    </div>
                    <div className={styles.rightSection}>
                      <div className={styles.details}>
                        <div>
                          <strong>Name:</strong> {org.name}
                        </div>
                        <div>
                          {" "}
                          <strong>Address:</strong> {org.address}
                        </div>
                        <div>
                          {" "}
                          <strong>Rera Number:</strong> {org.reraNumber}
                        </div>
                        <div>
                          <strong>Created At:</strong>{" "}
                          {new Date(org.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.dropdown}>
                        <DropdownMenu
                          soldFlats={org.soldFlats}
                          totalFlats={org.totalFlats}
                          unsoldFlats={org.unsoldFlats}
                          reraNumber={org.reraNumber}
                          fetchData={() => fetchData(null, false)}
                        />
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
