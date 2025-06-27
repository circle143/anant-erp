"use client";

import React, { useEffect, useState } from "react";
import { getAllSocietyBrokers, getSocieties } from "@/redux/action/org-admin";
import { getBrokerReport } from "@/redux/action/org-admin";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "@/components/Loader/Loader";
import styles from "./page.module.scss";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import Image from "next/image";

type Owner = {
    id: string;
    salutation?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    email?: string;
    aadharNumber?: string;
    panNumber?: string;
    photo?: string;
};

type Receipt = {
    id: string;
    totalAmount: string;
    mode: string;
    dateIssued: string;
    bankName: string;
    transactionNumber: string;
    failed: boolean;
    amount: string;
    cgst: string;
    sgst: string;
    cleared?: {
        bank: {
            name: string;
            accountNumber: string;
        };
    };
};

const Page = () => {
    const [societies, setSocieties] = useState<
        { reraNumber: string; name: string }[]
    >([]);
    const [brokers, setBrokers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const fetchAllSocieties = async (
            cursor: string | null = null,
            accumulated: any[] = []
        ): Promise<any[]> => {
            setLoading(true);
            const response = await getSocieties(cursor);
            if (response?.error) {
                setLoading(false);
                return accumulated;
            }

            const items = response?.data?.items || [];
            const newData = [...accumulated, ...items];
            const hasNext = response?.data?.pageInfo?.nextPage;
            const nextCursor = response?.data?.pageInfo?.cursor;

            if (hasNext && nextCursor) {
                return await fetchAllSocieties(nextCursor, newData);
            }
            setLoading(false);
            return newData;
        };

        fetchAllSocieties().then(setSocieties);
    }, []);

    const formik = useFormik({
        initialValues: {
            society: "",
            broker: "",
            recordsFrom: "",
            recordsTill: "",
        },
        validationSchema: Yup.object({
            society: Yup.string().required("Select a society"),
            broker: Yup.string().required("Select a broker"),
            recordsFrom: Yup.date()
                .nullable()
                .transform((value, originalValue) =>
                    !originalValue ? null : new Date(originalValue)
                )
                .max(new Date(), "Start date can't be in the future"),
            recordsTill: Yup.date()
                .nullable()
                .transform((value, originalValue) =>
                    !originalValue ? null : new Date(originalValue)
                )
                .max(new Date(), "End date can't be in the future")
                .test(
                    "endDateAfterStartDate",
                    "End date cannot be before start date",
                    function (value) {
                        const { recordsFrom } = this.parent;
                        if (!value || !recordsFrom) return true;
                        return new Date(value) >= new Date(recordsFrom);
                    }
                ),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const data = await getBrokerReport(
                values.society,
                values.broker,
                values.recordsFrom ? new Date(values.recordsFrom) : undefined,
                values.recordsTill ? new Date(values.recordsTill) : undefined
            );
            setReport(data);
            setLoading(false);
        },
    });

    const handleSocietyChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const reraNumber = e.target.value;
        formik.setFieldValue("society", reraNumber);
        formik.setFieldValue("broker", "");
        setBrokers([]);
        setReport(null);

        if (!reraNumber) return;

        setLoading(true);
        const fetchAllBrokers = async (
            cursor: string | null = null,
            accumulated: { id: string; name: string }[] = []
        ): Promise<{ id: string; name: string }[]> => {
            const response = await getAllSocietyBrokers(reraNumber, cursor);
            if (response?.error) return accumulated;

            const items = response?.data?.items || [];
            const newData = [...accumulated, ...items];
            const hasNext = response?.data?.pageInfo?.nextPage;
            const nextCursor = response?.data?.pageInfo?.cursor;

            if (hasNext && nextCursor) {
                return await fetchAllBrokers(nextCursor, newData);
            }
            return newData;
        };

        const brokerData = await fetchAllBrokers();
        setBrokers(brokerData);
        setLoading(false);
    };

    const handleClearFilter = async () => {
        formik.setFieldValue("recordsFrom", "");
        formik.setFieldValue("recordsTill", "");
        formik.setTouched({ recordsFrom: false, recordsTill: false });
        formik.setErrors({ recordsFrom: undefined, recordsTill: undefined });

        if (formik.values.society && formik.values.broker) {
            setLoading(true);
            const data = await getBrokerReport(
                formik.values.society,
                formik.values.broker
            );
            setReport(data);
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN");
    };

    return (
        <div className={styles.container}>
            <h1>Broker Report</h1>
            {loading && <Loader />}

            <form onSubmit={formik.handleSubmit}>
                <div className={styles.formGroup}>
                    <div>
                        <label>Society</label>
                        <select
                            name="society"
                            value={formik.values.society}
                            onChange={handleSocietyChange}
                            className={styles.brokerSelect}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Society</option>
                            {societies.map((s) => (
                                <option key={s.reraNumber} value={s.reraNumber}>
                                    {s.name} (Rera: {s.reraNumber})
                                </option>
                            ))}
                        </select>
                        {formik.touched.society && formik.errors.society && (
                            <p style={{ color: "red" }}>
                                {formik.errors.society}
                            </p>
                        )}
                    </div>

                    <div className={styles.broker}>
                        <label>Broker</label>
                        <select
                            name="broker"
                            value={formik.values.broker}
                            className={styles.brokerSelect}
                            onChange={async (e) => {
                                const brokerId = e.target.value;
                                await formik.setFieldValue("broker", brokerId);
                                if (formik.values.society && brokerId) {
                                    setLoading(true);
                                    const data = await getBrokerReport(
                                        formik.values.society,
                                        brokerId,
                                        formik.values.recordsFrom
                                            ? new Date(
                                                  formik.values.recordsFrom
                                              )
                                            : undefined,
                                        formik.values.recordsTill
                                            ? new Date(
                                                  formik.values.recordsTill
                                              )
                                            : undefined
                                    );
                                    console.log(data);
                                    setReport(data);
                                    setLoading(false);
                                }
                            }}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Broker</option>
                            {brokers.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {formik.touched.broker && formik.errors.broker && (
                            <p style={{ color: "red" }}>
                                {formik.errors.broker}
                            </p>
                        )}
                    </div>
                </div>
                <div className={styles.dateGroup}>
                    <div>
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="recordsFrom"
                            className={styles.date}
                            max={formik.values.recordsTill || today}
                            value={formik.values.recordsFrom}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.recordsFrom &&
                            formik.errors.recordsFrom && (
                                <p style={{ color: "red" }}>
                                    {formik.errors.recordsFrom}
                                </p>
                            )}
                    </div>

                    <div>
                        <label>End Date</label>
                        <input
                            type="date"
                            name="recordsTill"
                            className={styles.date}
                            min={formik.values.recordsFrom || ""}
                            max={today}
                            value={formik.values.recordsTill}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.recordsTill &&
                            formik.errors.recordsTill && (
                                <p style={{ color: "red" }}>
                                    {formik.errors.recordsTill}
                                </p>
                            )}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Apply Filter"}
                        </button>
                        <button
                            type="button"
                            onClick={handleClearFilter}
                            disabled={
                                loading ||
                                !formik.values.society ||
                                !formik.values.broker
                            }
                        >
                            Clear Filter
                        </button>
                    </div>
                </div>
            </form>

            {report && (
                <div className={styles.reportContainer}>
                    <h2>Broker Report Data</h2>
                    <div className={styles.summarySection}>
                        <h3>
                            Total Sales amount:{" "}
                            {formatIndianCurrencyWithDecimals(
                                report.data.totalAmount
                            )}
                        </h3>
                    </div>
                    <div className={styles.brokerDetails}>
                        <h3>Broker Details</h3>
                        <div className={styles.detailGrid}>
                            <p>
                                <strong>Broker Name:</strong>{" "}
                                {report.data.details.name}
                            </p>
                            <p>
                                <strong>Aadhar Number:</strong>{" "}
                                {report.data.details.aadharNumber}
                            </p>
                            <p>
                                <strong>PAN Number:</strong>{" "}
                                {report.data.details.panNumber}
                            </p>
                            <p>
                                <strong>Registered On:</strong>{" "}
                                {formatDate(report.data.details.createdAt)}
                            </p>
                        </div>
                    </div>

                    {report.data.details.sales?.length > 0 ? (
                        report.data.details.sales.map(
                            (sale: any, index: number) => (
                                <div
                                    key={sale.id}
                                    className={styles.saleSection}
                                >
                                    <hr className={styles.sectionDivider} />
                                    <h3>Sale #{index + 1}</h3>

                                    <div className={styles.flatDetails}>
                                        <h4>Flat Details</h4>
                                        <div className={styles.detailGrid}>
                                            <p>
                                                <strong>Flat Name:</strong>{" "}
                                                {sale.flat.name}
                                            </p>
                                            <p>
                                                <strong>Floor Number:</strong>{" "}
                                                {sale.flat.floorNumber}
                                            </p>
                                            <p>
                                                <strong>Facing:</strong>{" "}
                                                {sale.flat.facing}
                                            </p>
                                            <p>
                                                <strong>Total Price:</strong>{" "}
                                                {formatIndianCurrencyWithDecimals(
                                                    sale.totalPrice
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.priceBreakdown}>
                                        <h4>Price Breakdown</h4>
                                        <table className={styles.detailsTable}>
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Description</th>
                                                    <th>Rate</th>
                                                    <th>Area</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sale.priceBreakdown.map(
                                                    (pb: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td>{pb.type}</td>
                                                            <td>
                                                                {pb.summary}
                                                            </td>
                                                            <td>
                                                                {pb.price}/sqft
                                                            </td>
                                                            <td>
                                                                {pb.superArea}{" "}
                                                                sqft
                                                            </td>
                                                            <td>
                                                                {formatIndianCurrencyWithDecimals(
                                                                    pb.total
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {sale.companyCustomer ? (
                                        <div className={styles.customerDetails}>
                                            <h4>Company Customer Details</h4>
                                            <div className={styles.detailGrid}>
                                                <p>
                                                    <strong>
                                                        Company Name:
                                                    </strong>{" "}
                                                    {sale.companyCustomer.name}
                                                </p>
                                                <p>
                                                    <strong>
                                                        Company PAN:
                                                    </strong>{" "}
                                                    {
                                                        sale.companyCustomer
                                                            .companyPan
                                                    }
                                                </p>
                                                <p>
                                                    <strong>GST:</strong>{" "}
                                                    {
                                                        sale.companyCustomer
                                                            .companyGst
                                                    }
                                                </p>
                                                <p>
                                                    <strong>
                                                        Aadhar Number:
                                                    </strong>{" "}
                                                    {sale.companyCustomer
                                                        .aadharNumber || "N/A"}
                                                </p>
                                                <p>
                                                    <strong>PAN:</strong>{" "}
                                                    {sale.companyCustomer
                                                        .panNumber || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : sale.owners?.length > 0 ? (
                                        <div className={styles.customerDetails}>
                                            <h4>Owner Details</h4>
                                            {sale.owners.map(
                                                (owner: Owner, i: number) => (
                                                    <div
                                                        key={owner.id}
                                                        className={
                                                            styles.ownerDetails
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.ownerImage
                                                            }
                                                        >
                                                            {owner.photo ? (
                                                                <Image
                                                                    src={
                                                                        owner.photo
                                                                    }
                                                                    alt={`${owner.firstName} ${owner.lastName}`}
                                                                    width={100}
                                                                    height={100}
                                                                    className={
                                                                        styles.profileImage
                                                                    }
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        styles.blankProfile
                                                                    }
                                                                >
                                                                    <span>
                                                                        {owner.firstName.charAt(
                                                                            0
                                                                        )}
                                                                        {owner.lastName.charAt(
                                                                            0
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.ownerInfo
                                                            }
                                                        >
                                                            <p>
                                                                <strong>
                                                                    Name:
                                                                </strong>{" "}
                                                                {`${
                                                                    owner.salutation ||
                                                                    ""
                                                                } ${
                                                                    owner.firstName
                                                                } ${
                                                                    owner.lastName
                                                                }`.trim()}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    DOB:
                                                                </strong>{" "}
                                                                {owner.dateOfBirth
                                                                    ? formatDate(
                                                                          owner.dateOfBirth
                                                                      )
                                                                    : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Phone:
                                                                </strong>{" "}
                                                                {owner.phoneNumber ||
                                                                    "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Email:
                                                                </strong>{" "}
                                                                {owner.email ||
                                                                    "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Aadhar:
                                                                </strong>{" "}
                                                                {owner.aadharNumber ||
                                                                    "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    PAN:
                                                                </strong>{" "}
                                                                {owner.panNumber ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : null}

                                    {sale.receipts?.length > 0 && (
                                        <div className={styles.receiptsSection}>
                                            <h4>Payment Receipts</h4>
                                            <table
                                                className={styles.detailsTable}
                                            >
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Mode</th>
                                                        <th>Bank</th>
                                                        <th>Transaction</th>
                                                        <th>Status</th>
                                                        <th>CGST</th>
                                                        <th>SGST</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sale.receipts.map(
                                                        (receipt: Receipt) => (
                                                            <tr
                                                                key={receipt.id}
                                                                className={
                                                                    receipt.failed
                                                                        ? styles.failedReceipt
                                                                        : ""
                                                                }
                                                            >
                                                                <td>
                                                                    {formatDate(
                                                                        receipt.dateIssued
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatIndianCurrencyWithDecimals(
                                                                        receipt.amount
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        receipt.mode
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {receipt
                                                                        .cleared
                                                                        ?.bank
                                                                        ? `${receipt.cleared.bank.name} (${receipt.cleared.bank.accountNumber})`
                                                                        : receipt.bankName ||
                                                                          "N/A"}
                                                                </td>
                                                                <td>
                                                                    {receipt.transactionNumber ||
                                                                        "N/A"}
                                                                </td>
                                                                <td>
                                                                    {receipt.failed
                                                                        ? "Failed"
                                                                        : receipt.cleared
                                                                        ? "Cleared"
                                                                        : "Pending"}
                                                                </td>
                                                                <td>
                                                                    {formatIndianCurrencyWithDecimals(
                                                                        receipt.cgst
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatIndianCurrencyWithDecimals(
                                                                        receipt.sgst
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )
                        )
                    ) : (
                        <p className={styles.noData}>
                            No sales data found for this broker.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Page;
