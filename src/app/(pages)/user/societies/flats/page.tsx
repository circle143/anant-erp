"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  getFlats,
  getAllSocietySoldFlats,
  getAllSocietyUnsoldFlats,
  getSocietyFlatsByName,
} from "@/redux/action/org-admin";
import { toast } from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { getUrl } from "aws-amplify/storage";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useRouter, useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { society_flats } from "@/utils/breadcrumbs";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setUnits } from "@/redux/slice/SocietyFlat";

const Page = () => {
  const [orgData, setOrgData] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const SocietyFlatData = useSelector((state: RootState) =>
    rera ? state.flats.societyFlats[rera] : null
  );
  const router = useRouter();
  const units = useSelector((state: RootState) => state.Society.units);
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(
    null
  );
  const [showAdditionalDetails, setShowAdditionalDetails] = useState<
    number | null
  >(null);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

  const fetchData = async (
    cursor: string | null = null,
    isNext = true,
    filter: string = "all",
    search: string = ""
  ) => {
    setLoading(true);
    if (!rera) return;

    let response;
    if (search.trim() !== "") {
      setIsSearchMode(true);
      response = await getSocietyFlatsByName(rera, search.trim(), cursor || "");
    } else {
      setIsSearchMode(false);
      if (filter === "all") {
        response = await getFlats(cursor || "", rera);
      } else if (filter === "sold") {
        response = await getAllSocietySoldFlats(cursor || "", rera);
      } else if (filter === "unsold") {
        response = await getAllSocietyUnsoldFlats(cursor || "", rera);
      } else {
        setLoading(false);
        return;
      }
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
                  console.error("Error generating URL for:", owner.photo, err);
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

    setOrgData(updatedItems);
    dispatch(setUnits(updatedItems));
    setHasNextPage(response.data.pageInfo.nextPage);
    setCursor(response.data.pageInfo.cursor);

    if (isNext && cursor !== null) {
      setCursorStack((prev) => [...prev, cursor]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (rera) {
      fetchData(null, false, selectedFilter, searchTerm);
    }
  }, [rera, selectedFilter]);

  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      setCursor(null);
      setCursorStack([]);
      setSearchTerm(value);
      fetchData(null, false, selectedFilter, value);
    }, 700),
    [rera, selectedFilter]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearchChange(value);
  };

  const handleNext = () => {
    fetchData(cursor, true, selectedFilter, searchTerm);
  };

  const handlePrevious = () => {
    if (cursorStack.length > 0) {
      const prevCursor = cursorStack[cursorStack.length - 2];
      setCursorStack((prev) => prev.slice(0, -1));
      fetchData(prevCursor, false, selectedFilter, searchTerm);
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

  const toggleAdditionalDetails = (index: number) => {
    setShowAdditionalDetails((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h2>Flat List</h2>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search by name"
            className={styles.searchInput}
            onChange={handleSearchChange}
          />

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
      </div>
      <CustomBreadcrumbs items={society_flats} />
      <div className={styles.flatCount}>
        {selectedFilter === "all" && (
          <p>Total Flats: {SocietyFlatData?.totalFlats}</p>
        )}
        {selectedFilter === "sold" && (
          <p>Sold Flats: {SocietyFlatData?.totalSoldFlats}</p>
        )}
        {selectedFilter === "unsold" && (
          <p>Unsold Flats: {SocietyFlatData?.totalUnsoldFlats}</p>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : (
        <>
          {units.length === 0 ? (
            <div className={styles.noData}>No data available</div>
          ) : (
            <>
              <ul className={styles.orgList}>
                {units.map((org, index) => (
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
                          <strong>Salable Area:</strong>{" "}
                          {org.salableArea
                            ? `${org.salableArea} Sq.Ft`
                            : "Not Available"}
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
                  disabled={cursorStack.length <= 0}
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
