"use client";
import React, { useEffect, useState } from "react";
import { getUsers, updateOrganizationUserRole } from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { getUrl } from "aws-amplify/storage";
import { toast } from "react-hot-toast";
import { UserRole } from "@/utils/routes/organization/types";
import { removeUserFromOrganization } from "@/redux/action/org-admin";
const Page = () => {
  const [orgData, setOrgData] = useState<UserItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    email: string;
    index: number;
  } | null>(null);

  interface UserItem {
    name: string;
    email: string;
    role: UserRole;
    profilePicture: string;
    createdAt: string;
  }

  const fetchData = async (cursor: string | null = null, isNext = true) => {
    setLoading(true);
    const response = await getUsers(cursor);
    if (!response.error && response.data?.items?.length) {
      const updatedItems = await Promise.all(
        response.data.items.map(async (item: UserItem) => {
          if (item.profilePicture) {
            try {
              const getUrlResult = await getUrl({
                path: item.profilePicture,
                options: { validateObjectExistence: true, expiresIn: 3600 },
              });
              return { ...item, profilePicture: getUrlResult.url.toString() };
            } catch {
              return item;
            }
          }
          return item;
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
    if (cursorStack.length > 0) {
      const prevCursor = cursorStack[cursorStack.length - 2];
      setCursorStack((prev) => prev.slice(0, -1));
      fetchData(prevCursor, false);
    }
  };

  const handleStatusClick = (index: number, currentRole: UserRole) => {
    setEditingIndex(index);
    setSelectedRole(currentRole);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setSelectedRole("");
  };

  const handleStatusChange = (value: string) => {
    setSelectedRole(value as UserRole);
  };

  const handleStatusDone = async () => {
    if (editingIndex === null || !selectedRole) return;
    const user = orgData[editingIndex];
    try {
      const response = await updateOrganizationUserRole(
        user.email,
        selectedRole
      );
      if (!response.error) {
        await fetchData(cursor, false);
      }
    } catch (error) {
      console.log("Error updating status:", error);
    } finally {
      handleCancelEdit();
    }
  };
  const handleDelete = (email: string, index: number) => {
    setUserToDelete({ email, index });
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await removeUserFromOrganization(userToDelete.email);
      if (!response.error) {
        // Optionally show success message
        await fetchData(cursor, false); // Refresh user list
        toast.success("User deleted successfully");
      }
    } catch (err) {
      toast.error("Error deleting user");
      // console.error("Error deleting user:", err);
    } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setUserToDelete(null);
  };
  return (
    <div className={`container ${styles.container}`}>
      <h2>Users List</h2>

      {loading ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : orgData.length === 0 ? (
        <div className={styles.noData}>No data available</div>
      ) : (
        <>
          <ul className={styles.orgList}>
            {orgData.map((org, index) => (
              <li key={index} className={styles.orgItem}>
                <div className={styles.logoContainer}>
                  {org.profilePicture ? (
                    <img
                      loading="lazy"
                      src={org.profilePicture}
                      alt={`${org.name} profile`}
                      className={styles.logo}
                    />
                  ) : (
                    <div className={styles.noLogo}>No Picture</div>
                  )}
                </div>

                <div className={styles.rightSection}>
                  <div className={styles.details}>
                    <div>
                      <strong>Name:</strong> {org.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {org.email}
                    </div>
                    <div>
                      <strong>Role:</strong>{" "}
                      {editingIndex === index ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className={styles.statusDropdown}
                        >
                          <option value="org-admin">Admin</option>
                          <option value="org-user">User</option>
                        </select>
                      ) : org.role === "org-admin" ? (
                        "Admin"
                      ) : (
                        "User"
                      )}
                    </div>

                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(org.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {editingIndex === index ? (
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
                    <div className={styles.groupButtons}>
                      <i
                        className="bx bxs-trash"
                        onClick={() => handleDelete(org.email, index)}
                      ></i>

                      <button
                        className={styles.updateButton}
                        onClick={() => handleStatusClick(index, org.role)}
                      >
                        Update Status
                      </button>
                    </div>
                  )}
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
      {showDeletePopup && userToDelete && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h4>Confirm Delete</h4>
            <p>
              Are you sure you want to remove{" "}
              <strong>{userToDelete.email}</strong>?
            </p>
            <div className={styles.popupButtons}>
              <button className={styles.confirmButton} onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className={styles.cancelButton} onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
