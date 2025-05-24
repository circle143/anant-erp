"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getTowerFlats,
  getAllTowerSoldFlats,
  getAllTowerUnsoldFlats,
  deleteFlat,
  clearSaleRecord,
} from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { getUrl, uploadData } from "aws-amplify/storage";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import PaymentBreakdownModal from "@/components/payment-breakdown/payment_breakdown";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setUnits } from "@/redux/slice/TowerFlat";

const ITEMS_PER_PAGE = 25;

const Page = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const towerID = searchParams.get("towerId");
  const towerFlatData = useSelector((state: RootState) =>
    towerID ? state.flats.towerFlats[towerID] : null
  );
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
  const units = useSelector((state: RootState) => state.TowerFlats.units);
  const dispatch = useDispatch();
  const fetchData = async (filter: string = "all") => {
    setLoading(true);
    if (!rera || !towerID) return;
    let response;
    if (filter === "all") {
      response = await getTowerFlats("", rera, towerID);
    } else if (filter === "sold") {
      response = await getAllTowerSoldFlats("", rera, towerID);
    } else if (filter === "unsold") {
      response = await getAllTowerUnsoldFlats("", rera, towerID);
    } else {
      console.error("Invalid filter:", filter);
      setLoading(false);
      return;
    }
    console.log("response", response);
    const updatedItems = await Promise.all(
      response.data.items.map(async (item: any) => {
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
                  return owner;
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

    dispatch(setUnits(updatedItems));
    // setAllData(updatedItems);
    setLoading(false);
  };
  useEffect(() => {
    fetchData(selectedFilter);
  }, [rera, towerID, selectedFilter]);

  // Apply search and pagination
  useEffect(() => {
    let filteredData = [...units];

    // Apply search filter
    if (searchQuery) {
      filteredData = filteredData.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.saleDetail?.owners?.some((owner: any) =>
            `${owner.firstName} ${owner.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      );
    }

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const validatedPage = currentPage > totalPages ? 1 : currentPage;

    if (validatedPage !== currentPage) {
      setCurrentPage(validatedPage);
    }

    const startIndex = (validatedPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    setDisplayedData(paginatedData);
  }, [units, searchQuery, currentPage]);

  const totalPages = Math.ceil(
    units.filter((item) =>
      searchQuery
        ? item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.saleDetail?.owners?.some((owner: any) =>
            `${owner.firstName} ${owner.lastName}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : true
    ).length / ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
        await fetchData(selectedFilter);
        toast.success("Flat deleted successfully");
      }
    } catch (err) {
      toast.error("Error deleting flat");
    } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
    }
  };

  const debouncedFilterChange = useCallback(
    debounce((value: string) => {
      setCurrentPage(1);
      setSelectedFilter(value);
    }, 300),
    []
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    debouncedFilterChange(value);
  };
  const handleEditSale = (
    reraNumber: string,
    applicantId: string,
    type: "user" | "company",
    towerID: string,
    flatId?: string,
    ownerIndex?: number
  ) => {
    const query = new URLSearchParams({
      reraNumber,
      id: applicantId,
      flatId: flatId || "",
      ownerIndex: ownerIndex !== undefined ? ownerIndex.toString() : "",
      type,
      towerId: towerID,
    }).toString();

    router.push(`/org-admin/society/towers/flats/edit-sale-details?${query}`);
  };
  const flat = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
    { name: "Flats" },
  ];
  const handleDeleteSale = async (saleId: string, reraNumber: string) => {
    if (!saleId || !reraNumber) {
      toast.error("Missing sale ID or RERA number.");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale record?"
    );
    if (!confirmed) return;
    const result = await clearSaleRecord(reraNumber, saleId);
    if (result?.error) {
      toast.error(`Failed to delete sale: ${result.message}`);
    } else {
      toast.success("Sale record deleted successfully.");
      fetchData(selectedFilter);
    }
  };
  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h2>Flat List</h2>
          <div className={styles.flatCount}>
            {selectedFilter === "all" && (
              <p>Total Flats: {towerFlatData?.totalFlats}</p>
            )}
            {selectedFilter === "sold" && (
              <p>Sold Flats: {towerFlatData?.totalSoldFlats} </p>
            )}
            {selectedFilter === "unsold" && (
              <p>Unsold Flats: {towerFlatData?.totalUnsoldFlats} </p>
            )}
          </div>
        </div>

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
          <input
            type="text"
            placeholder="Search by name or owner"
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            className={styles.newFlatButton}
            onClick={() =>
              router.push(
                `/org-admin/society/towers/flats/new-flat?rera=${rera}&towerId=${towerID}`
              )
            }
          >
            New Flat
          </button>
        </div>
      </div>
      <CustomBreadcrumbs items={flat} />
      {loading ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : (
        <>
          {displayedData.length === 0 ? (
            <div className={styles.noData}>No data available</div>
          ) : (
            <>
              <ul className={styles.orgList}>
                {displayedData.map((org, index) => (
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
                            <div className={styles.editButtons}>
                              <button
                                className={styles.toggleButton}
                                onClick={() => toggleOwnerDetails(index)}
                              >
                                {expandedOwnerIndex === index
                                  ? "Hide Owner Details"
                                  : "Show Owner Details"}
                              </button>
                              {org.saleDetail?.id && rera && (
                                <button
                                  className={styles.cancelButton}
                                  onClick={() =>
                                    handleDeleteSale(org.saleDetail!.id, rera)
                                  }
                                >
                                  Delete Sale
                                </button>
                              )}
                            </div>

                            {expandedOwnerIndex === index && (
                              <div className={styles.ownerCards}>
                                <div className={styles.ownerCard}>
                                  <h4>Broker Details:</h4>
                                  <p>
                                    <strong>Name:</strong>{" "}
                                    {org.saleDetail.broker.name ||
                                      "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Aadhar Number:</strong>{" "}
                                    {org.saleDetail.broker.aadharNumber ||
                                      "Not Available"}
                                  </p>
                                  <p>
                                    <strong>PAN:</strong>{" "}
                                    {org.saleDetail.broker.panNumber ||
                                      "Not Available"}
                                  </p>
                                </div>

                                {org.saleDetail?.companyCustomer ? (
                                  <div className={styles.ownerCard}>
                                    <h4>Company</h4>
                                    <p>
                                      <strong>Company Name:</strong>{" "}
                                      {org.saleDetail.companyCustomer.name ||
                                        "Not Available"}
                                    </p>
                                    <p>
                                      <strong>Company GST:</strong>{" "}
                                      {org.saleDetail.companyCustomer
                                        .companyGst || "Not Available"}
                                    </p>
                                    <p>
                                      <strong>Company PAN:</strong>{" "}
                                      {org.saleDetail.companyCustomer
                                        .companyPan || "Not Available"}
                                    </p>
                                    <p>
                                      <strong>PAN:</strong>{" "}
                                      {org.saleDetail.companyCustomer
                                        .panNumber || "Not Available"}
                                    </p>
                                    <p>
                                      <strong>Sale Date:</strong>{" "}
                                      {org.saleDetail?.companyCustomer
                                        ?.createdAt
                                        ? new Date(
                                            org.saleDetail.companyCustomer.createdAt
                                          ).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          })
                                        : "Not Available"}
                                    </p>
                                    {rera &&
                                      towerID &&
                                      org.saleDetail?.companyCustomer?.id && (
                                        <button
                                          className={styles.toggleButton}
                                          onClick={() =>
                                            handleEditSale(
                                              rera,
                                              org.saleDetail.companyCustomer.id,
                                              "company",
                                              towerID
                                            )
                                          }
                                        >
                                          Edit Company's Details
                                        </button>
                                      )}
                                  </div>
                                ) : (
                                  org.saleDetail?.owners?.map(
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
                                            <div className={styles.noLogo}>
                                              No Logo
                                            </div>
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
                                          {owner.maritalStatus ||
                                            "Not Available"}
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
                                          {owner.aadharNumber ||
                                            "Not Available"}
                                        </p>
                                        <p>
                                          <strong>Sale Date:</strong>{" "}
                                          {owner.createdAt
                                            ? new Date(
                                                owner.createdAt
                                              ).toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata",
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                              })
                                            : "Not Available"}
                                        </p>
                                        {rera && towerID && owner.id && (
                                          <button
                                            className={styles.toggleButton}
                                            onClick={() =>
                                              handleEditSale(
                                                rera,
                                                owner.id,
                                                "user",
                                                towerID,
                                                org.saleDetail?.flatId ?? "",
                                                i
                                              )
                                            }
                                          >
                                            Edit Applicant's Details
                                          </button>
                                        )}
                                      </div>
                                    )
                                  )
                                )}

                                {showAdditionalDetails === index && (
                                  <>
                                    <div className={styles.totalPriceSection}>
                                      <h4>Paid</h4>
                                      <p>
                                        {formatIndianCurrencyWithDecimals(
                                          org.saleDetail?.paid != null
                                            ? org.saleDetail.paid
                                            : "0.00"
                                        )}
                                      </p>
                                    </div>
                                    <div className={styles.totalPriceSection}>
                                      <h4>Remaining</h4>
                                      <p>
                                        {formatIndianCurrencyWithDecimals(
                                          org.saleDetail?.paid != null
                                            ? org.saleDetail.remaining
                                            : "0.00"
                                        )}
                                      </p>
                                    </div>
                                    {/* Total Price */}
                                    <div className={styles.totalPriceSection}>
                                      <h4>Total Price</h4>
                                      <p>
                                        {formatIndianCurrencyWithDecimals(
                                          org.saleDetail?.paid != null
                                            ? org.saleDetail.totalPrice
                                            : "0.00"
                                        )}
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
                                                    {formatIndianCurrencyWithDecimals(
                                                      item.price != null
                                                        ? item.price
                                                        : "0.00"
                                                    )}
                                                  </td>
                                                  <td>
                                                    {item.type ||
                                                      "Not Available"}
                                                  </td>
                                                  <td>
                                                    {item.superArea != null
                                                      ? item.superArea
                                                      : "0.00"}
                                                  </td>
                                                  <td>
                                                    {formatIndianCurrencyWithDecimals(
                                                      item.total != null
                                                        ? item.total
                                                        : "0.00"
                                                    )}
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
                                <div className={styles.buttonGroup}>
                                  <button
                                    className={styles.toggleButton}
                                    onClick={() =>
                                      toggleAdditionalDetails(index)
                                    }
                                  >
                                    {showAdditionalDetails === index
                                      ? "Show Less"
                                      : "Show More"}
                                  </button>

                                  <PaymentBreakdownModal
                                    id={org.saleDetail?.id}
                                    rera={rera ?? ""}
                                    paid={org.saleDetail?.paid ?? "0.00"}
                                    remaining={
                                      org.saleDetail?.remaining ?? "0.00"
                                    }
                                    totalPrice={
                                      org.saleDetail?.totalPrice ?? "0.00"
                                    }
                                  />
                                </div>
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || totalPages === 0}
                  className={styles.navButton}
                >
                  Previous
                </button>
                {/* <span>
                                    Page {totalPages === 0 ? 0 : currentPage} of{" "}
                                    {totalPages}
                                </span> */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
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
              <strong> {userToDelete.name}</strong>?
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
