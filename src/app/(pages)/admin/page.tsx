"use client";

import React, { useEffect, useState } from "react";
import { getOrg, updateStatus } from "@/redux/action/admin"; // make sure updateStatus is imported
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";

const Page = () => {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [id, setId] = useState<string>("");
  const fetchData = async (cursor: string | null = null, isNext = true) => {
    setLoading(true);
    const response = await getOrg(cursor);
    if (!response.error) {
      setOrgData(response.data.items);
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
  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedStatus(""); // or reset to org.status if you want to keep current state
  };
  const handleStatusClick = (orgId: string, currentStatus: string) => {
    setEditingId(orgId);
    setSelectedStatus(currentStatus);
  };

  const handleStatusChange = async (orgId: string, status: string) => {
    setSelectedStatus(status);
    setId(orgId);
   
  };
  const handleStatusDone = async () => {
     const response = await updateStatus(id, selectedStatus);
     setEditingId(null);
     fetchData(cursor, false);
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
                    <div className={styles.noLogo}>No Logo</div>
                  )}
                </div>
                <div className={styles.rightSection}>
                  <div className={styles.details}>
                    <div>
                      <strong>Name:</strong> {org.name}
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(org.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>GST:</strong> {org.gst || "N/A"}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {editingId === org.id ? (
                        <select
                          value={selectedStatus}
                          onChange={(e) =>
                            handleStatusChange(org.id, e.target.value)
                          }
                          className={styles.statusDropdown}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archive">Archive</option>
                        </select>
                      ) : (
                        org.status
                      )}
                    </div>
                  </div>

                  {editingId === org.id ? (
                    <>
                      <button
                        className={styles.updateButton}
                        onClick={() => handleStatusDone()}
                      >
                        Done
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.updateButton}
                      onClick={() => handleStatusClick(org.id, org.status)}
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
    </div>
  );
};

export default Page;
