"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getTowerFlats,
  getAllTowerSoldFlats,
  getAllTowerUnsoldFlats,
  deleteFlat,
} from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { getUrl, uploadData } from "aws-amplify/storage";
const Page = () => {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(
    null
  );
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const towerID = searchParams.get("towerId");
  const router = useRouter();
  const [showAdditionalDetails, setShowAdditionalDetails] = useState<
    number | null
  >(null);
  const [userToDelete, setUserToDelete] = useState<{
    flatId: string;
    name: string;
    index: number;
  } | null>(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
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
      response = await getAllTowerUnsoldFlats(cursor || "", rera, towerID);
    } else {
      console.error("Invalid filter:", filter);
      setLoading(false);
      return;
    }
    // console.log("response", response);
    const updatedItems = await Promise.all(
      response.data.items.map(async (item: any) => {
        // If there's a saleDetail and at least one owner with a photo
        if (item.saleDetail?.owners && Array.isArray(item.saleDetail.owners)) {
          const updatedOwners = await Promise.all(
            item.saleDetail.owners.map(async (owner: any) => {
              if (owner.photo) {
                try {
                  const signedUrl = await getUrl({
                    path: owner.photo,
                    options: {
                      validateObjectExistence: true,
                      expiresIn: 3600,
                    },
                  });
                  console.log(
                    "No photo found for owner:",
                    signedUrl.url.toString()
                  );
                  return {
                    ...owner,
                    photo: signedUrl.url.toString(),
                  };
                } catch (err) {
                  console.error(
                    "Error generating URL for photo:",
                    owner.photo,
                    err
                  );
                  return owner; // fallback to original if error
                }
              }

              return owner;
            })
          );
          return {
            ...item,
            saleDetail: {
              ...item.saleDetail,
              owners: updatedOwners,
            },
          };
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

    setLoading(false);
  };

  useEffect(() => {
    fetchData(null, false, selectedFilter);
  }, [rera, towerID, selectedFilter, cursorStack]);

  const handleNext = () => {
    if (cursor) {
      setCursorStack((prev) => [...prev, cursor]);
    }
    fetchData(cursor, true, selectedFilter);
  };

  const handlePrevious = () => {
    if (cursorStack.length > 0) {
      const prevCursor = cursorStack[cursorStack.length - 2];
      setCursorStack((prev) => prev.slice(0, -1));
      fetchData(prevCursor, false, selectedFilter);
    }
  };
  const toggleOwnerDetails = (index: number) => {
    setExpandedOwnerIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  const toggleAdditionalDetails = (index: number) => {
    setShowAdditionalDetails((prev) => (prev === index ? null : index));
  };
  const handleDelete = (flatId: string, name: string, index: number) => {
    setUserToDelete({ flatId, name, index });
    setShowDeletePopup(true);
  };
  const cancelDelete = () => {
    setShowDeletePopup(false);
    setUserToDelete(null);
  };
  const confirmDelete = async () => {
    if (!userToDelete || !rera) {
      toast.error("Missing RERA information");
      return;
    }

    try {
      const response = await deleteFlat(userToDelete.flatId, rera);
      if (!response.error) {
        // Optionally show success message
        await fetchData(null, false, selectedFilter); // Refresh user list
        toast.success("Flat deleted successfully");
      }
    } catch (err) {
      toast.error("Error deleting flat");
      // console.error("Error deleting user:", err);
    } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
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
                {orgData.map((org, index) => (
                  <li key={org.id} className={styles.orgItem}>
                    <div className={styles.rightSection}>
                      <div className={styles.details}>
                        <div>
                          <strong>Name:</strong> {org.name || "Not Available"}
                        </div>
                        <div>
                          <strong>Floor:</strong>{" "}
                          {org.floorNumber ?? "Not Available"}
                        </div>
                        <div>
                          <strong>Facing:</strong>{" "}
                          {org.facing || "Not Available"}
                        </div>
                        <div>
                          <strong>Created At:</strong>{" "}
                          {org.createdAt
                            ? new Date(org.createdAt).toLocaleString()
                            : "Not Available"}
                        </div>

                        {org.saleDetail && (
                          <div className={styles.ownerDetails}>
                            <button
                              className={styles.toggleButton}
                              onClick={() => toggleOwnerDetails(index)}
                            >
                              {expandedOwnerIndex === index
                                ? "Hide Owner Details"
                                : "Show Owner Details"}
                            </button>

                            {expandedOwnerIndex === index && (
                              <div className={styles.ownerCards}>
                                {org.saleDetail?.owners?.map(
                                  (owner: any, i: number) => (
                                    <div key={i} className={styles.ownerCard}>
                                      <h4>Applicant {i + 1}</h4>
                                      <div className={styles.imgContainer}>
                                        {owner.photo ? (
                                          <img
                                            src={owner.photo}
                                            alt={`Owner ${i + 1}`}
                                            className={styles.ownerImage}
                                          />
                                        ) : (
                                          <span>Not Available</span>
                                        )}
                                      </div>
                                      <p>
                                        <strong>Full Name:</strong>{" "}
                                        {[
                                          owner.salutation,
                                          owner.firstName,
                                          owner.middleName,
                                          owner.lastName,
                                        ]
                                          .filter(Boolean)
                                          .join(" ") || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Email:</strong>{" "}
                                        {owner.email || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Phone:</strong>{" "}
                                        {owner.phoneNumber || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Gender:</strong>{" "}
                                        {owner.gender || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>DOB:</strong>{" "}
                                        {owner.dateOfBirth
                                          ? new Date(
                                              owner.dateOfBirth
                                            ).toLocaleDateString()
                                          : "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Nationality:</strong>{" "}
                                        {owner.nationality || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Marital Status:</strong>{" "}
                                        {owner.maritalStatus || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Number of Children:</strong>{" "}
                                        {owner.numberOfChildren ??
                                          "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Profession:</strong>{" "}
                                        {owner.profession || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Designation:</strong>{" "}
                                        {owner.designation || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Company Name:</strong>{" "}
                                        {owner.companyName || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Passport Number:</strong>{" "}
                                        {owner.passportNumber ||
                                          "Not Available"}
                                      </p>
                                      <p>
                                        <strong>PAN Number:</strong>{" "}
                                        {owner.panNumber || "Not Available"}
                                      </p>
                                      <p>
                                        <strong>Aadhar Number:</strong>{" "}
                                        {owner.aadharNumber || "Not Available"}
                                      </p>
                                    </div>
                                  )
                                )}
                                <button
                                  className={styles.toggleButton}
                                  onClick={() => toggleAdditionalDetails(index)}
                                >
                                  {showAdditionalDetails === index
                                    ? "Show Less"
                                    : "Show More"}
                                </button>
                                {showAdditionalDetails === index && (
                                  <>
                                    <div className={styles.totalPriceSection}>
                                      <h4>Paid</h4>
                                      <p>
                                        <strong>₹</strong>{" "}
                                        {org.saleDetail?.paid != null
                                          ? org.saleDetail.paid
                                          : "0.00"}
                                      </p>
                                    </div>
                                    <div className={styles.totalPriceSection}>
                                      <h4>Remaining</h4>
                                      <p>
                                        <strong>₹</strong>{" "}
                                        {org.saleDetail?.paid != null
                                          ? org.saleDetail.remaining
                                          : "0.00"}
                                      </p>
                                    </div>
                                    {/* Total Price */}
                                    <div className={styles.totalPriceSection}>
                                      <h4>Total Price</h4>
                                      <p>
                                        <strong>₹</strong>{" "}
                                        {org.saleDetail?.paid != null
                                          ? org.saleDetail.totalPrice
                                          : "0.00"}
                                      </p>
                                    </div>
                                    {/* Price Breakdown */}
                                    <div
                                      className={styles.priceBreakdownSection}
                                    >
                                      <h4>Price Breakdown</h4>
                                      {org.saleDetail?.priceBreakdown?.length >
                                      0 ? (
                                        <table
                                          className={styles.breakdownTable}
                                        >
                                          <thead>
                                            <tr>
                                              <th>#</th>
                                              <th>Summary</th>
                                              <th>Price</th>

                                              <th>Type</th>
                                              <th>Super Area</th>
                                              <th>Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {org.saleDetail.priceBreakdown.map(
                                              (item: any, index: number) => (
                                                <tr key={index}>
                                                  <td>{index + 1}</td>
                                                  <td>{item.summary}</td>
                                                  <td>
                                                    ₹
                                                    {item.price != null
                                                      ? item.price
                                                      : "0.00"}
                                                  </td>
                                                  <td>
                                                    {item.type ||
                                                      "Not Available"}
                                                  </td>
                                                  <td>
                                                    {item.superArea != null
                                                      ? 
                                                          item.superArea
                                                        
                                                      : "0.00"}
                                                  </td>
                                                  <td>
                                                    ₹
                                                    {item.total != null
                                                      ? 
                                                          item.total
                                                        
                                                      : "0.00"}
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p>Not Available</p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={styles.groupButtons}>
                        <i
                          className="bx bxs-trash"
                          onClick={() => handleDelete(org.id, org.name, index)}
                        ></i>
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
      {showDeletePopup && userToDelete && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h4>Confirm Delete</h4>
            <p>
              Are you sure you want to remove
              <strong>{userToDelete.name}</strong>?
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
