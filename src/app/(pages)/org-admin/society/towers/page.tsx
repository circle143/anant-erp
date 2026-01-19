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
import ExcelUploadModal from "@/components/ExcelUploadModal/ExcelUploadModal";
import { bulkCreateTower } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import { fetchAuthSession } from "aws-amplify/auth";

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
  const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);

  // State for user role
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Check if user is admin
  const isAdmin = userRole === "circle-admin";

  // Fetch user role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) {
          setRoleLoading(false);
          return;
        }

        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userGroups: string[] = decodedPayload["cognito:groups"] || [];

        // Get the first matched role
        const role = userGroups.find((group) =>
          ["circle-admin", "org-admin", "org-user", "org-viewer"].includes(
            group
          )
        );

        setUserRole(role || null);
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setRoleLoading(false);
      }
    };

    getUserRole();
  }, []);

  const handleTowerUpload = async (file: File) => {
    if (!rera) return;

    try {
      const response = await bulkCreateTower(rera, file);

      // Check for error returned in response
      if (response?.error) {
        toast.error(response.message || "Upload failed");
        return;
      }

      toast.success("Towers uploaded successfully");
      fetchData(null, false);
    } catch (error: any) {
      toast.error(
        error?.message || "An unexpected error occurred during upload"
      );
    }
  };

  const fetchData = async (cursor: string | null = null, isNext = true) => {
    setLoading(true);
    if (!rera) return;

    const response = await getTowers(cursor, rera);

    const towers = response.data.items;
    setOrgData(towers);
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

  // Show loader while checking role
  if (roleLoading) {
    return (
      <div className={`container ${styles.container}`}>
        <div className={styles.loading}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h2>Tower List</h2>
        {/* Only show buttons for admins */}
        {isAdmin && (
          <div className={styles.buttongroup}>
            <button
              onClick={() =>
                router.push(`/org-admin/society/towers/new-tower?rera=${rera}`)
              }
            >
              New Tower
            </button>
            <button onClick={() => setIsTowerModalOpen(true)}>
              New Towers
            </button>
          </div>
        )}
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
                    <div className={styles.rightSection}>
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
                        <DropdownTower
                          reraNumber={org.societyId}
                          towerId={org.id}
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
      {/* Only render modal for admins */}
      {isAdmin && (
        <ExcelUploadModal
          open={isTowerModalOpen}
          onClose={() => setIsTowerModalOpen(false)}
          title="Upload Tower Excel"
          onUpload={handleTowerUpload}
        />
      )}
    </div>
  );
};

export default Page;
