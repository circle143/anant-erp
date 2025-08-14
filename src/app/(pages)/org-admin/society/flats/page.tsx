"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    getFlats,
    getAllSocietySoldFlats,
    getAllSocietyUnsoldFlats,
    deleteFlat,
    getSocietyFlatsByName,
    clearSaleRecord,
} from "@/redux/action/org-admin";
import { toast } from "react-hot-toast";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { debounce } from "lodash";
import { getUrl, uploadData } from "aws-amplify/storage";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import PaymentBreakdownModal from "@/components/payment-breakdown/payment_breakdown";
import ReceiptModal from "@/components/receiptModal/page";
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
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
const [createReceiptModalOpen, setCreateReceiptModalOpen] = useState(false);
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
    const [userToDelete, setUserToDelete] = useState<{
        flatId: string;
        name: string;
        index: number;
    } | null>(null);
    const dispatch = useDispatch();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
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
            response = await getSocietyFlatsByName(
                rera,
                search.trim(),
                cursor || ""
            );
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
                if (
                    item.saleDetail?.owners &&
                    Array.isArray(item.saleDetail.owners)
                ) {
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
                                        "Error generating URL for:",
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
        fetchData(null, false, selectedFilter, searchTerm);
    }, [rera, selectedFilter]);
    const handleEditSale = (
        reraNumber: string,
        applicantId: string,
        type: "user" | "company",
        flatId?: string,
        ownerIndex?: number
    ) => {
        const query = new URLSearchParams({
            reraNumber,
            id: applicantId,
            flatId: flatId || "",
            ownerIndex: ownerIndex !== undefined ? ownerIndex.toString() : "",
            type,
        }).toString();

        router.push(`/org-admin/society/flats/edit-sale-details?${query}`);
    };

    const debouncedSearchChange = useCallback(
        debounce((value: string) => {
            setCursor(null);
            setCursorStack([]);
            setSearchTerm(value);
            fetchData(null, false, selectedFilter, value);
        }, 700),
        [rera, selectedFilter]
    );

    // 🧠 Called on input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        debouncedSearchChange(value);
    };
    const handleNext = () => {
        fetchData(cursor, true, selectedFilter, searchTerm);
    };

    // ◀️ Previous Page
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
        setExpandedOwnerIndex((prevIndex) =>
            prevIndex === index ? null : index
        );
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
                await fetchData(null, false, selectedFilter, searchTerm); // Refresh user list
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
    const handleRedirect = (path: string, id: string) => {
        const url = `${path}?id=${id}&rera=${rera}`;
        router.push(url);
    };
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
            fetchData(null, false, selectedFilter, searchTerm);
        }
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
                        onChange={handleSearchChange} // Implement this in your component
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
                                                    <strong>Name:</strong>{" "}
                                                    {org.name ||
                                                        "Not Available"}
                                                </div>
                                                <div>
                                                    <strong>Floor:</strong>{" "}
                                                    {org.floorNumber ??
                                                        "Not Available"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Salable Area:
                                                    </strong>{" "}
                                                    {org.salableArea
                                                        ? `${org.salableArea} Sq.Ft`
                                                        : "Not Available"}
                                                </div>
                                                <div>
                                                    <strong>Facing:</strong>{" "}
                                                    {org.facing ||
                                                        "Not Available"}
                                                </div>
                                                <div>
                                                    <strong>Created At:</strong>{" "}
                                                    {org.createdAt
                                                        ? new Date(
                                                            org.createdAt
                                                        ).toLocaleString()
                                                        : "Not Available"}
                                                </div>

                                                {org.saleDetail && (
                                                    <div
                                                        className={
                                                            styles.ownerDetails
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.editButtons
                                                            }
                                                        >
                                                            <button
                                                                className={
                                                                    styles.toggleButton
                                                                }
                                                                onClick={() =>
                                                                    toggleOwnerDetails(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                {expandedOwnerIndex ===
                                                                    index
                                                                    ? "Hide Owner Details"
                                                                    : "Show Owner Details"}
                                                            </button>
                                                            {org.saleDetail
                                                                ?.id &&
                                                                rera && (
                                                                    <button
                                                                        className={
                                                                            styles.cancelButton
                                                                        }
                                                                        onClick={() =>
                                                                            handleDeleteSale(
                                                                                org.saleDetail!
                                                                                    .id,
                                                                                rera
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                        Sale
                                                                    </button>
                                                                )}
                                                        </div>

                                                        {expandedOwnerIndex ===
                                                            index && (
                                                                <div
                                                                    className={
                                                                        styles.ownerCards
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.ownerCard
                                                                        }
                                                                    >
                                                                        <h4>
                                                                            Broker
                                                                            Details:
                                                                        </h4>
                                                                        <p>
                                                                            <strong>
                                                                                Name:
                                                                            </strong>{" "}
                                                                            {org
                                                                                .saleDetail
                                                                                .broker
                                                                                .name ||
                                                                                "Not Available"}
                                                                        </p>
                                                                        <p>
                                                                            <strong>
                                                                                Aadhar
                                                                                Number:
                                                                            </strong>{" "}
                                                                            {org
                                                                                .saleDetail
                                                                                .broker
                                                                                .aadharNumber ||
                                                                                "Not Available"}
                                                                        </p>
                                                                        <p>
                                                                            <strong>
                                                                                PAN:
                                                                            </strong>{" "}
                                                                            {org
                                                                                .saleDetail
                                                                                .broker
                                                                                .panNumber ||
                                                                                "Not Available"}
                                                                        </p>
                                                                    </div>
                                                                    {org.saleDetail
                                                                        ?.companyCustomer ? (
                                                                        <div
                                                                            className={
                                                                                styles.ownerCard
                                                                            }
                                                                        >
                                                                            <h4>
                                                                                Company
                                                                            </h4>
                                                                            <p>
                                                                                <strong>
                                                                                    Company
                                                                                    Name:
                                                                                </strong>{" "}
                                                                                {org
                                                                                    .saleDetail
                                                                                    .companyCustomer
                                                                                    .name ||
                                                                                    "Not Available"}
                                                                            </p>
                                                                            <p>
                                                                                <strong>
                                                                                    Company
                                                                                    GST:
                                                                                </strong>{" "}
                                                                                {org
                                                                                    .saleDetail
                                                                                    .companyCustomer
                                                                                    .companyGst ||
                                                                                    "Not Available"}
                                                                            </p>
                                                                            <p>
                                                                                <strong>
                                                                                    Company
                                                                                    PAN:
                                                                                </strong>{" "}
                                                                                {org
                                                                                    .saleDetail
                                                                                    .companyCustomer
                                                                                    .companyPan ||
                                                                                    "Not Available"}
                                                                            </p>
                                                                            <p>
                                                                                <strong>
                                                                                    PAN:
                                                                                </strong>{" "}
                                                                                {org
                                                                                    .saleDetail
                                                                                    .companyCustomer
                                                                                    .panNumber ||
                                                                                    "Not Available"}
                                                                            </p>
                                                                            <p>
                                                                                <strong>
                                                                                    Sale
                                                                                    Date:
                                                                                </strong>{" "}
                                                                                {org
                                                                                    .saleDetail
                                                                                    ?.companyCustomer
                                                                                    ?.createdAt
                                                                                    ? new Date(
                                                                                        org.saleDetail.companyCustomer.createdAt
                                                                                    ).toLocaleString(
                                                                                        "en-IN",
                                                                                        {
                                                                                            timeZone:
                                                                                                "Asia/Kolkata",
                                                                                            day: "2-digit",
                                                                                            month: "2-digit",
                                                                                            year: "numeric",
                                                                                            hour: "2-digit",
                                                                                            minute: "2-digit",
                                                                                            hour12: true,
                                                                                        }
                                                                                    )
                                                                                    : "Not Available"}
                                                                            </p>
                                                                            {rera &&
                                                                                org
                                                                                    .saleDetail
                                                                                    ?.companyCustomer
                                                                                    ?.id && (
                                                                                    <button
                                                                                        className={
                                                                                            styles.toggleButton
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleEditSale(
                                                                                                rera,
                                                                                                org
                                                                                                    .saleDetail
                                                                                                    ?.companyCustomer
                                                                                                    ?.id ??
                                                                                                "",
                                                                                                "company"
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Edit
                                                                                        Company's
                                                                                        Details
                                                                                    </button>
                                                                                )}
                                                                        </div>
                                                                    ) : (
                                                                        org.saleDetail?.owners?.map(
                                                                            (
                                                                                owner: any,
                                                                                i: number
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className={
                                                                                        styles.ownerCard
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Applicant{" "}
                                                                                        {i +
                                                                                            1}
                                                                                    </h4>
                                                                                    <div
                                                                                        className={
                                                                                            styles.imgContainer
                                                                                        }
                                                                                    >
                                                                                        {owner.photo ? (
                                                                                            <img
                                                                                                src={
                                                                                                    owner.photo
                                                                                                }
                                                                                                alt={`Owner ${i +
                                                                                                    1
                                                                                                    }`}
                                                                                                className={
                                                                                                    styles.ownerImage
                                                                                                }
                                                                                            />
                                                                                        ) : (
                                                                                            <div
                                                                                                className={
                                                                                                    styles.noLogo
                                                                                                }
                                                                                            >
                                                                                                No
                                                                                                Logo
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Full
                                                                                            Name:
                                                                                        </strong>{" "}
                                                                                        {[
                                                                                            owner.salutation,
                                                                                            owner.firstName,
                                                                                            owner.middleName,
                                                                                            owner.lastName,
                                                                                        ]
                                                                                            .filter(
                                                                                                Boolean
                                                                                            )
                                                                                            .join(
                                                                                                " "
                                                                                            ) ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Email:
                                                                                        </strong>{" "}
                                                                                        {owner.email ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Phone:
                                                                                        </strong>{" "}
                                                                                        {owner.phoneNumber ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Gender:
                                                                                        </strong>{" "}
                                                                                        {owner.gender ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            DOB:
                                                                                        </strong>{" "}
                                                                                        {owner.dateOfBirth
                                                                                            ? new Date(
                                                                                                owner.dateOfBirth
                                                                                            ).toLocaleDateString()
                                                                                            : "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Nationality:
                                                                                        </strong>{" "}
                                                                                        {owner.nationality ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Marital
                                                                                            Status:
                                                                                        </strong>{" "}
                                                                                        {owner.maritalStatus ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Number
                                                                                            of
                                                                                            Children:
                                                                                        </strong>{" "}
                                                                                        {owner.numberOfChildren ??
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Profession:
                                                                                        </strong>{" "}
                                                                                        {owner.profession ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Designation:
                                                                                        </strong>{" "}
                                                                                        {owner.designation ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Company
                                                                                            Name:
                                                                                        </strong>{" "}
                                                                                        {owner.companyName ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Passport
                                                                                            Number:
                                                                                        </strong>{" "}
                                                                                        {owner.passportNumber ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            PAN
                                                                                            Number:
                                                                                        </strong>{" "}
                                                                                        {owner.panNumber ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Aadhar
                                                                                            Number:
                                                                                        </strong>{" "}
                                                                                        {owner.aadharNumber ||
                                                                                            "Not Available"}
                                                                                    </p>
                                                                                    <p>
                                                                                        <strong>
                                                                                            Sale
                                                                                            Date:
                                                                                        </strong>{" "}
                                                                                        {owner.createdAt
                                                                                            ? new Date(
                                                                                                owner.createdAt
                                                                                            ).toLocaleString(
                                                                                                "en-IN",
                                                                                                {
                                                                                                    timeZone:
                                                                                                        "Asia/Kolkata",
                                                                                                    day: "2-digit",
                                                                                                    month: "2-digit",
                                                                                                    year: "numeric",
                                                                                                    hour: "2-digit",
                                                                                                    minute: "2-digit",
                                                                                                    hour12: true,
                                                                                                }
                                                                                            )
                                                                                            : "Not Available"}
                                                                                    </p>
                                                                                    {rera &&
                                                                                        owner.id && (
                                                                                            <button
                                                                                                className={
                                                                                                    styles.toggleButton
                                                                                                }
                                                                                                onClick={() =>
                                                                                                    handleEditSale(
                                                                                                        rera,
                                                                                                        owner.id,
                                                                                                        "user",
                                                                                                        org
                                                                                                            .saleDetail
                                                                                                            ?.flatId ??
                                                                                                        "",
                                                                                                        i
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                Edit
                                                                                                Applicant's
                                                                                                Details
                                                                                            </button>
                                                                                        )}
                                                                                </div>
                                                                            )
                                                                        )
                                                                    )}

                                                                    {showAdditionalDetails ===
                                                                        index && (
                                                                            <>
                                                                                <div
                                                                                    className={
                                                                                        styles.totalPriceSection
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Paid
                                                                                    </h4>
                                                                                    <p>
                                                                                        {formatIndianCurrencyWithDecimals(
                                                                                            org
                                                                                                .saleDetail
                                                                                                ?.paid !=
                                                                                                null
                                                                                                ? org
                                                                                                    .saleDetail
                                                                                                    .paid
                                                                                                : "0.00"
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                <div
                                                                                    className={
                                                                                        styles.totalPriceSection
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Remaining
                                                                                    </h4>
                                                                                    <p>
                                                                                        {formatIndianCurrencyWithDecimals(
                                                                                            org
                                                                                                .saleDetail
                                                                                                ?.paid !=
                                                                                                null
                                                                                                ? org
                                                                                                    .saleDetail
                                                                                                    .remaining
                                                                                                : "0.00"
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                <div
                                                                                    className={
                                                                                        styles.totalPriceSection
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Total Payable Amount
                                                                                    </h4>
                                                                                    <p>
                                                                                        {formatIndianCurrencyWithDecimals(
                                                                                            org
                                                                                                .saleDetail
                                                                                                ?.paid !=
                                                                                                null
                                                                                                ? org
                                                                                                    .saleDetail
                                                                                                    .totalPayableAmount
                                                                                                : "0.00"
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                {/* Total Price */}
                                                                                <div
                                                                                    className={
                                                                                        styles.totalPriceSection
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Total
                                                                                        Price
                                                                                    </h4>
                                                                                    <p>
                                                                                        {formatIndianCurrencyWithDecimals(
                                                                                            org
                                                                                                .saleDetail
                                                                                                ?.paid !=
                                                                                                null
                                                                                                ? org
                                                                                                    .saleDetail
                                                                                                    .totalPrice
                                                                                                : "0.00"
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                {/* Price Breakdown */}
                                                                                <div
                                                                                    className={
                                                                                        styles.priceBreakdownSection
                                                                                    }
                                                                                >
                                                                                    <h4>
                                                                                        Price
                                                                                        Breakdown
                                                                                    </h4>
                                                                                    {org
                                                                                        .saleDetail
                                                                                        ?.priceBreakdown
                                                                                        ?.length >
                                                                                        0 ? (
                                                                                        <table
                                                                                            className={
                                                                                                styles.breakdownTable
                                                                                            }
                                                                                        >
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <th>
                                                                                                        #
                                                                                                    </th>
                                                                                                    <th>
                                                                                                        Summary
                                                                                                    </th>
                                                                                                    <th>
                                                                                                        Price
                                                                                                    </th>

                                                                                                    <th>
                                                                                                        Type
                                                                                                    </th>
                                                                                                    <th>
                                                                                                        Salable
                                                                                                        Area
                                                                                                        (Sq.Ft)
                                                                                                    </th>
                                                                                                    <th>
                                                                                                        Total
                                                                                                    </th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {org.saleDetail.priceBreakdown.map(
                                                                                                    (
                                                                                                        item: any,
                                                                                                        index: number
                                                                                                    ) => (
                                                                                                        <tr
                                                                                                            key={
                                                                                                                index
                                                                                                            }
                                                                                                        >
                                                                                                            <td>
                                                                                                                {index +
                                                                                                                    1}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {
                                                                                                                    item.summary
                                                                                                                }
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {formatIndianCurrencyWithDecimals(
                                                                                                                    item.price !=
                                                                                                                        null
                                                                                                                        ? item.price
                                                                                                                        : "0.00"
                                                                                                                )}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {item.type ||
                                                                                                                    "Not Available"}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {item.salableArea !=
                                                                                                                    null
                                                                                                                    ? item.salableArea
                                                                                                                    : "0.00"}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {formatIndianCurrencyWithDecimals(
                                                                                                                    item.total !=
                                                                                                                        null
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
                                                                                        <p>
                                                                                            Not
                                                                                            Available
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    <div
                                                                        className={
                                                                            styles.buttonGroup
                                                                        }
                                                                    >
                                                                        <button
                                                                            className={
                                                                                styles.toggleButton
                                                                            }
                                                                            onClick={() =>
                                                                                toggleAdditionalDetails(
                                                                                    index
                                                                                )
                                                                            }
                                                                        >
                                                                            {showAdditionalDetails ===
                                                                                index
                                                                                ? "Show Less"
                                                                                : "Show More"}
                                                                        </button>
                                                                        <>
                                                                            <button   className={
                                                                                styles.toggleButton
                                                                            } onClick={() => setReceiptModalOpen(true)}>View Receipts</button>

                                                                            <ReceiptModal
                                                                                id={
                                                                                    org
                                                                                        .saleDetail
                                                                                        ?.id
                                                                                }
                                                                                rera={rera ?? ""}
                                                                                towerId={org.towerId}
                                                                                fetchData={() =>
                                                                                    fetchData(
                                                                                        null,
                                                                                        false,
                                                                                        selectedFilter,
                                                                                        searchTerm
                                                                                    )
                                                                                }
                                                                                open={receiptModalOpen}
                                                                                onClose={() => setReceiptModalOpen(false)}
                                                                                createReceiptOpen={createReceiptModalOpen}
                                                                                onCreateReceiptOpen={() => setCreateReceiptModalOpen(true)}
                                                                                onCreateReceiptClose={() => setCreateReceiptModalOpen(false)}
                                                                            />
                                                                        </>
                                                          
                                                                        <PaymentBreakdownModal
                                                                            id={
                                                                                org
                                                                                    .saleDetail
                                                                                    ?.id
                                                                            }
                                                                            rera={
                                                                                rera ??
                                                                                ""
                                                                            }
                                                                            paid={
                                                                                org
                                                                                    .saleDetail
                                                                                    ?.paid ??
                                                                                "0.00"
                                                                            }
                                                                            remaining={
                                                                                org
                                                                                    .saleDetail
                                                                                    ?.remaining ??
                                                                                "0.00"
                                                                            }
                                                                            totalPrice={
                                                                                org
                                                                                    .saleDetail
                                                                                    ?.totalPrice ??
                                                                                "0.00"
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className={styles.groupButtons}
                                            >
                                                <i
                                                    className="bx bxs-trash"
                                                    onClick={() =>
                                                        handleDelete(
                                                            org.id,
                                                            org.name,
                                                            index
                                                        )
                                                    }
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
                            <strong> {userToDelete.name}</strong>?
                        </p>
                        <div className={styles.popupButtons}>
                            <button
                                className={styles.confirmButton}
                                onClick={confirmDelete}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={cancelDelete}
                            >
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
