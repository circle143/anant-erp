// app/org-admin/society/towers/flats/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getTowerFlats,
  getAllTowerSoldFlats,
  getAllTowerUnsoldFlats,
  deleteFlat,
  clearSaleRecord,
  bulkCreateFlat,
} from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { getUrl } from "aws-amplify/storage";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import PaymentBreakdownModal from "@/components/payment-breakdown/payment_breakdown";
import ReceiptModal from "@/components/receiptModal/page";
import ExcelUploadModal from "@/components/ExcelUploadModal/ExcelUploadModal";
import DropdownFlat from "@/components/Dropdown/DropDownFlat";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setUnits } from "@/redux/slice/TowerFlat";

const ITEMS_PER_PAGE = 25;

const Page = () => {
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [isFlatModalOpen, setIsFlatModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAdditionalDetails, setShowAdditionalDetails] = useState<number | null>(null);

  // Centralized receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [createReceiptModalOpen, setCreateReceiptModalOpen] = useState(false);
  const [selectedSaleIdForReceipt, setSelectedSaleIdForReceipt] = useState<string | null>(null);

  // Centralized delete popup state
  const [userToDelete, setUserToDelete] = useState<{ flatId: string; name: string; index: number } | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const towerID = searchParams.get("towerId");
  const router = useRouter();

  const dispatch = useDispatch();
  const units = useSelector((state: RootState) => state.TowerFlats.units);
  const TowerFlatData = useSelector((state: RootState) => {
    if (!towerID) return null;
    return state.flats.towerFlats[towerID];
  });

  const fetchData = async (filter: string = "all") => {
    setLoading(true);
    if (!rera || !towerID) return;

    let response;
    if (filter === "all") response = await getTowerFlats("", rera, towerID);
    else if (filter === "sold") response = await getAllTowerSoldFlats("", rera, towerID);
    else if (filter === "unsold") response = await getAllTowerUnsoldFlats("", rera, towerID);
    else {
      console.error("Invalid filter:", filter);
      setLoading(false);
      return;
    }

    const updatedItems = await Promise.all(
      (response?.data?.items ?? []).map(async (item: any) => {
        if (item.saleDetail?.owners && Array.isArray(item.saleDetail.owners)) {
          const updatedOwners = await Promise.all(
            item.saleDetail.owners.map(async (owner: any) => {
              if (owner.photo) {
                try {
                  const signedUrl = await getUrl({
                    path: owner.photo,
                    options: { validateObjectExistence: true, expiresIn: 3600 },
                  });
                  return { ...owner, photo: signedUrl.url.toString() };
                } catch {
                  return owner; // keep original if signing fails
                }
              }
              return owner;
            })
          );
          return { ...item, saleDetail: { ...item.saleDetail, owners: updatedOwners } };
        }
        return item;
      })
    );

    dispatch(setUnits(updatedItems));
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rera, towerID, selectedFilter]);

  // Filter + paginate
  useEffect(() => {
    let filtered = [...units];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.saleDetail?.owners?.some((owner: any) =>
            `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(q)
          )
      );
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const validatedPage = currentPage > totalPages ? 1 : currentPage;
    if (validatedPage !== currentPage) setCurrentPage(validatedPage);

    const startIndex = (validatedPage - 1) * ITEMS_PER_PAGE;
    setDisplayedData(filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE));
  }, [units, searchQuery, currentPage]);

  const totalPages = Math.ceil(
    units.filter((item) =>
      searchQuery
        ? item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.saleDetail?.owners?.some((owner: any) =>
            `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true
    ).length / ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const debouncedFilterChange = useCallback(
    debounce((value: string) => {
      setCurrentPage(1);
      setSelectedFilter(value);
    }, 300),
    []
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    debouncedFilterChange(e.target.value);
  };

  const toggleOwnerDetails = (index: number) =>
    setExpandedOwnerIndex((prev) => (prev === index ? null : index));

  const toggleAdditionalDetails = (index: number) =>
    setShowAdditionalDetails((prev) => (prev === index ? null : index));

  const handleFlatEdit = (flat: any) => {
    const query = new URLSearchParams({
      rera: rera || "",
      towerId: towerID || "",
      flatId: flat.id,
    }).toString();

    sessionStorage.setItem(
      "editFlatData",
      JSON.stringify({
        name: flat.name || "",
        floorNumber: flat.floorNumber || "",
        facing: flat.facing || "Default",
        saleableArea: flat.salableArea || "",
        unitType: flat.unitType || "",
      })
    );

    router.push(`/org-admin/society/towers/flats/edit?${query}`);
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
      } else {
        toast.error(response.message || "Error deleting flat");
      }
    } catch {
      toast.error("Error deleting flat");
    } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
    }
  };

  const handleEditSale = (
    reraNumber: string,
    applicantId: string,
    type: "user" | "company",
    towerIdVal: string,
    flatId?: string,
    ownerIndex?: number
  ) => {
    const query = new URLSearchParams({
      reraNumber,
      id: applicantId,
      flatId: flatId || "",
      ownerIndex: ownerIndex !== undefined ? ownerIndex.toString() : "",
      type,
      towerId: towerIdVal,
    }).toString();

    router.push(`/org-admin/society/towers/flats/edit-sale-details?${query}`);
  };

  const handleDeleteSale = async (saleId: string, reraNumber: string) => {
    if (!saleId || !reraNumber) {
      toast.error("Missing sale ID or RERA number.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this sale record?");
    if (!confirmed) return;
    const result = await clearSaleRecord(reraNumber, saleId);
    if (result?.error) toast.error(`Failed to delete sale: ${result.message}`);
    else {
      toast.success("Sale record deleted successfully.");
      fetchData(selectedFilter);
    }
  };

  const handleFlatUpload = async (file: File) => {
    if (!rera || !towerID) return;
    try {
      const response = await bulkCreateFlat(rera, towerID, file);
      if (response?.error) {
        toast.error(response.message || "Flat upload failed");
        return;
      }
      toast.success("Flats uploaded successfully");
      fetchData(); 
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred during flat upload");
    }
  };

  useEffect(() => {
    if (totalPages > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const breadcrumbs = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    { name: "Towers", href: `/org-admin/society/towers?rera=${rera}` },
    { name: "Flats" },
  ];

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h2>Flat List</h2>
          <div className={styles.flatCount}>
            {selectedFilter === "all" && <p>Total Flats: {TowerFlatData?.totalFlats}</p>}
            {selectedFilter === "sold" && <p>Sold Flats: {TowerFlatData?.totalSoldFlats}</p>}
            {selectedFilter === "unsold" && <p>Unsold Flats: {TowerFlatData?.totalUnsoldFlats}</p>}
          </div>
        </div>

        <div className={styles.actions}>
          <select className={styles.selectFilter} onChange={handleFilterChange} defaultValue="all">
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
            onClick={() => router.push(`/org-admin/society/towers/flats/new-flat?rera=${rera}&towerId=${towerID}`)}
          >
            New Flat
          </button>
          <button className={styles.newFlatButton} onClick={() => setIsFlatModalOpen(true)}>
            New Flats
          </button>
        </div>
      </div>

      <CustomBreadcrumbs items={breadcrumbs} />

      {loading ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : displayedData.length === 0 ? (
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
                      <strong>Floor:</strong> {org.floorNumber ?? "Not Available"}
                    </div>
                    <div>
                      <strong>Salable Area:</strong>{" "}
                      {org.salableArea ? `${org.salableArea} Sq.Ft` : "Not Available"}
                    </div>
                    <div>
                      <strong>Type:</strong> {org.unitType ?? "Not Available"}
                    </div>
                    <div>
                      <strong>Facing:</strong> {org.facing || "Not Available"}
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {org.createdAt ? new Date(org.createdAt).toLocaleString() : "Not Available"}
                    </div>

                    {org.saleDetail && (
                      <div className={styles.ownerDetails}>
                        <div className={styles.editButtons}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => toggleOwnerDetails(index)}
                          >
                            {expandedOwnerIndex === index ? "Hide Owner Details" : "Show Owner Details"}
                          </button>
                          {org.saleDetail?.id && rera && (
                            <button
                              className={styles.cancelButton}
                              onClick={() => handleDeleteSale(org.saleDetail!.id, rera)}
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
                                {org.saleDetail.broker?.name || "Not Available"}
                              </p>
                              <p>
                                <strong>Aadhar Number:</strong>{" "}
                                {org.saleDetail.broker?.aadharNumber || "Not Available"}
                              </p>
                              <p>
                                <strong>PAN:</strong>{" "}
                                {org.saleDetail.broker?.panNumber || "Not Available"}
                              </p>
                            </div>

                            {org.saleDetail?.companyCustomer ? (
                              <div className={styles.ownerCard}>
                                <h4>Company</h4>
                                <p>
                                  <strong>Company Name:</strong>{" "}
                                  {org.saleDetail.companyCustomer.name || "Not Available"}
                                </p>
                                <p>
                                  <strong>Company GST:</strong>{" "}
                                  {org.saleDetail.companyCustomer.companyGst || "Not Available"}
                                </p>
                                <p>
                                  <strong>Company PAN:</strong>{" "}
                                  {org.saleDetail.companyCustomer.companyPan || "Not Available"}
                                </p>
                                <p>
                                  <strong>PAN:</strong>{" "}
                                  {org.saleDetail.companyCustomer.panNumber || "Not Available"}
                                </p>
                                <p>
                                  <strong>Sale Date:</strong>{" "}
                                  {org.saleDetail?.companyCustomer?.createdAt
                                    ? new Date(org.saleDetail.companyCustomer.createdAt).toLocaleString("en-IN", {
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
                                {rera && towerID && org.saleDetail?.companyCustomer?.id && (
                                  <button
                                    className={styles.toggleButton}
                                    onClick={() =>
                                      handleEditSale(rera, org.saleDetail.companyCustomer.id, "company", towerID)
                                    }
                                  >
                                    Edit Company's Details
                                  </button>
                                )}
                              </div>
                            ) : (
                              org.saleDetail?.owners?.map((owner: any, i: number) => (
                                <div key={i} className={styles.ownerCard}>
                                  <h4>Applicant {i + 1}</h4>
                                  <div className={styles.imgContainer}>
                                    {owner.photo ? (
                                      <img src={owner.photo} alt={`Owner ${i + 1}`} className={styles.ownerImage} />
                                    ) : (
                                      <div className={styles.noLogo}>No Logo</div>
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
                                    <strong>Email:</strong> {owner.email || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Phone:</strong> {owner.phoneNumber || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Gender:</strong> {owner.gender || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>DOB:</strong>{" "}
                                    {owner.dateOfBirth
                                      ? new Date(owner.dateOfBirth).toLocaleDateString()
                                      : "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Nationality:</strong> {owner.nationality || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Marital Status:</strong> {owner.maritalStatus || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Number of Children:</strong>{" "}
                                    {owner.numberOfChildren ?? "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Profession:</strong> {owner.profession || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Designation:</strong> {owner.designation || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Company Name:</strong> {owner.companyName || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Passport Number:</strong>{" "}
                                    {owner.passportNumber || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>PAN Number:</strong> {owner.panNumber || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Aadhar Number:</strong> {owner.aadharNumber || "Not Available"}
                                  </p>
                                  <p>
                                    <strong>Sale Date:</strong>{" "}
                                    {owner.createdAt
                                      ? new Date(owner.createdAt).toLocaleString("en-IN", {
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
                              ))
                            )}

                            {showAdditionalDetails === index && (
                              <>
                                <div className={styles.totalPriceSection}>
                                  <h4>Paid</h4>
                                  <p>
                                    {formatIndianCurrencyWithDecimals(
                                      org.saleDetail?.paid != null ? org.saleDetail.paid : "0.00"
                                    )}
                                  </p>
                                </div>
                                <div className={styles.totalPriceSection}>
                                  <h4>Remaining</h4>
                                  <p>
                                    {formatIndianCurrencyWithDecimals(
                                      org.saleDetail?.remaining != null ? org.saleDetail.remaining : "0.00"
                                    )}
                                  </p>
                                </div>
                                <div className={styles.totalPriceSection}>
                                  <h4>Total Payable Amount</h4>
                                  <p>
                                    {formatIndianCurrencyWithDecimals(
                                      org.saleDetail?.totalPayableAmount != null
                                        ? org.saleDetail.totalPayableAmount
                                        : "0.00"
                                    )}
                                  </p>
                                </div>
                                <div className={styles.totalPriceSection}>
                                  <h4>Total Price</h4>
                                  <p>
                                    {formatIndianCurrencyWithDecimals(
                                      org.saleDetail?.totalPrice != null ? org.saleDetail.totalPrice : "0.00"
                                    )}
                                  </p>
                                </div>

                                <div className={styles.priceBreakdownSection}>
                                  <h4>Price Breakdown</h4>
                                  {org.saleDetail?.priceBreakdown?.length > 0 ? (
                                    <table className={styles.breakdownTable}>
                                      <thead>
                                        <tr>
                                          <th>#</th>
                                          <th>Summary</th>
                                          <th>Price</th>
                                          <th>Type</th>
                                          <th>Salable Area (Sq.Ft)</th>
                                          <th>Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {org.saleDetail.priceBreakdown.map((item: any, i2: number) => (
                                          <tr key={i2}>
                                            <td>{i2 + 1}</td>
                                            <td>{item.summary}</td>
                                            <td>
                                              {formatIndianCurrencyWithDecimals(
                                                item.price != null ? item.price : "0.00"
                                              )}
                                            </td>
                                            <td>{item.type || "Not Available"}</td>
                                            <td>{item.salableArea != null ? item.salableArea : "0.00"}</td>
                                            <td>
                                              {formatIndianCurrencyWithDecimals(
                                                item.total != null ? item.total : "0.00"
                                              )}
                                            </td>
                                          </tr>
                                        ))}
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
                                onClick={() => toggleAdditionalDetails(index)}
                              >
                                {showAdditionalDetails === index ? "Show Less" : "Show More"}
                              </button>

                              <button
                                className={styles.toggleButton}
                                onClick={() => {
                                  if (!org.saleDetail?.id) return;
                                  setSelectedSaleIdForReceipt(org.saleDetail.id);
                                  setReceiptModalOpen(true);
                                }}
                              >
                                View Receipts
                              </button>

                              <PaymentBreakdownModal
                                id={org.saleDetail?.id}
                                rera={rera ?? ""}
                                paid={org.saleDetail?.paid ?? "0.00"}
                                remaining={org.saleDetail?.remaining ?? "0.00"}
                                totalPrice={org.saleDetail?.totalPrice ?? "0.00"}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions dropdown (Edit / Payment Plans / Delete) */}
                  <div className={styles.groupButtons}>
                    <DropdownFlat
                      reraNumber={rera ?? ""}
                      towerId={towerID ?? ""}
                      flat={org}
                      fetchData={() => fetchData(selectedFilter)}
                      onDeleteClick={() => handleDelete(org.id, org.name, index)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.paginationControls}>
            <button
              onClick={() => {
                if (currentPage > 1 && totalPages !== 0) {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              disabled={currentPage === 1 || totalPages === 0}
              className={styles.navButton}
            >
              Previous
            </button>

            <button
              onClick={() => {
                if (currentPage < totalPages && totalPages !== 0) {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              disabled={currentPage === totalPages || totalPages === 0}
              className={styles.navButton}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Global Delete Popup */}
      {showDeletePopup && userToDelete && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h4>Confirm Delete</h4>
            <p>
              Are you sure you want to remove <strong>{userToDelete.name}</strong>?
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

      {/* Centralized Receipt Modal */}
      <ReceiptModal
        id={selectedSaleIdForReceipt ?? ""}
        rera={rera ?? ""}
        towerId={towerID ?? ""}
        open={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedSaleIdForReceipt(null);
        }}
        fetchData={fetchData}
        createReceiptOpen={createReceiptModalOpen}
        onCreateReceiptOpen={() => setCreateReceiptModalOpen(true)}
        onCreateReceiptClose={() => setCreateReceiptModalOpen(false)}
      />

      {/* Bulk Upload Modal */}
      <ExcelUploadModal
        open={isFlatModalOpen}
        onClose={() => setIsFlatModalOpen(false)}
        title="Upload Flat Excel"
        onUpload={handleFlatUpload}
      />
    </div>
  );
};

export default Page;
