"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getFlats,
  getAllSocietySoldFlats,
  getAllSocietyUnsoldFlats,
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
  const router = useRouter();
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(
    null
  );
  const fetchData = async (
    cursor: string | null = null,
    isNext = true,
    filter: string = "all"
  ) => {
    setLoading(true);
    if (!rera) return;

    let response;
    if (filter === "all") {
      response = await getFlats(cursor || "", rera);
    } else if (filter === "sold") {
      response = await getAllSocietySoldFlats(cursor || "", rera);
    } else if (filter === "unsold") {
      response = await getAllSocietyUnsoldFlats(cursor || "", rera);
    } else {
      console.error("Invalid filter:", filter);
      setLoading(false);
      return;
    }

    console.log("response", response);

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
  }, [rera, selectedFilter]);

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
  const toggleOwnerDetails = (index: number) => {
    setExpandedOwnerIndex((prevIndex) => (prevIndex === index ? null : index));
  };
  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h2>Flat List</h2>
        <select
          className={styles.selectFilter}
          onChange={handleFilterChange}
          defaultValue="all"
        >
          <option value="all">All</option>
          <option value="sold">Sold</option>
          <option value="unsold">Unsold</option>
        </select>
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
                          <strong>Flat Status:</strong>{" "}
                          {org.soldBy || "Not Available"}
                        </div>
                        <div>
                          <strong>Created At:</strong>{" "}
                          {org.createdAt
                            ? new Date(org.createdAt).toLocaleString()
                            : "Not Available"}
                        </div>

                        {org.owners && org.owners.length > 0 && (
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
                                {org.owners.map((owner: any, i: number) => (
                                  <div key={i} className={styles.ownerCard}>
                                    <h4>Applicant {i + 1}</h4>
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
                                      {owner.passportNumber || "Not Available"}
                                    </p>
                                    <p>
                                      <strong>Pan Number:</strong>{" "}
                                      {owner.panNumber || "Not Available"}
                                    </p>
                                    <p>
                                      <strong>Aadhar Number:</strong>{" "}
                                      {owner.aadharNumber || "Not Available"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
