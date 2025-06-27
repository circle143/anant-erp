"use client";

import React, { useEffect, useState } from "react";
import {
    getAllSocietyBanks,
    getSocieties,
    getBankReport,
} from "@/redux/action/org-admin";
import { useFormik } from "formik";
import * as Yup from "yup";
import Loader from "@/components/Loader/Loader";
import styles from "./page.module.scss";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import Image from "next/image";

type ClearedReceipt = {
    receiptId: string;
    bankId: string;
    receipt: {
        id: string;
        amount: string;
        cgst: string;
        sgst: string;
        dateIssued: string;
        failed: boolean;
        mode: string;
        totalAmount: string;
        transactionNumber: string;
        bankName: string;
        sale?: {
            flat?: {
                name: string;
                floorNumber: number;
                facing: string;
            };
            companyCustomer?: {
                name: string;
                companyPan: string;
                companyGst: string;
            };
            owners?: {
                id: number;
                aadharNumber: any;
                firstName: string;
                lastName: string;
                panNumber?: string;
            }[];
        };
    };
    createdAt: string;
};

type BankDetails = {
    id: string;
    name: string;
    accountNumber: string;
    clearedReceipts: ClearedReceipt[];
    createdAt: string;
    updatedAt: string;
    totalAmount: string;
};

const Page = () => {
    const [societies, setSocieties] = useState<
        { reraNumber: string; name: string }[]
    >([]);
    const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<{
        error: boolean;
        data: {
            Details: BankDetails;
            totalAmount: string;
        };
    } | null>(null);

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
            bank: "",
            recordsFrom: "",
            recordsTill: "",
        },
        validationSchema: Yup.object({
            society: Yup.string().required("Select a society"),
            bank: Yup.string().required("Select a bank"),
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
            const data = await getBankReport(
                values.society,
                values.bank,
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
        formik.setFieldValue("bank", "");
        setBanks([]);
        setReport(null);

        if (!reraNumber) return;

        setLoading(true);
        const fetchAllBanks = async (
            cursor: string | null = null,
            accumulated: { id: string; name: string }[] = []
        ): Promise<{ id: string; name: string }[]> => {
            const response = await getAllSocietyBanks(reraNumber, cursor);
            if (response?.error) return accumulated;

            const items = response?.data?.items || [];
            const newData = [...accumulated, ...items];
            const hasNext = response?.data?.pageInfo?.nextPage;
            const nextCursor = response?.data?.pageInfo?.cursor;

            if (hasNext && nextCursor) {
                return await fetchAllBanks(nextCursor, newData);
            }
            return newData;
        };

        const bankData = await fetchAllBanks();
        setBanks(bankData);
        setLoading(false);
    };

    const handleClearFilter = async () => {
        formik.setFieldValue("recordsFrom", "");
        formik.setFieldValue("recordsTill", "");
        formik.setTouched({ recordsFrom: false, recordsTill: false });
        formik.setErrors({ recordsFrom: undefined, recordsTill: undefined });

        if (formik.values.society && formik.values.bank) {
            setLoading(true);
            const data = await getBankReport(
                formik.values.society,
                formik.values.bank
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
            <h1>Bank Report</h1>
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

                    <div className={styles.bank}>
                        <label>Bank</label>
                        <select
                            name="bank"
                            value={formik.values.bank}
                            className={styles.brokerSelect}
                            onChange={async (e) => {
                                const bankId = e.target.value;
                                await formik.setFieldValue("bank", bankId);
                                if (formik.values.society && bankId) {
                                    setLoading(true);
                                    const data = await getBankReport(
                                        formik.values.society,
                                        bankId,
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
                                    console.log("Bank Report Data:", data);
                                    setReport(data);
                                    setLoading(false);
                                }
                            }}
                            onBlur={formik.handleBlur}
                        >
                            <option value="">Select Bank</option>
                            {banks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {formik.touched.bank && formik.errors.bank && (
                            <p style={{ color: "red" }}>{formik.errors.bank}</p>
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
                                !formik.values.bank
                            }
                        >
                            Clear Filter
                        </button>
                    </div>
                </div>
            </form>

            {report && (
                <div className={styles.reportContainer}>
                    <h2>Bank Report Data</h2>
                    <div className={styles.summarySection}>
                        <h3>
                            Total Amount:{" "}
                            {formatIndianCurrencyWithDecimals(
                                report.data.totalAmount
                            )}
                        </h3>
                    </div>
                    <div className={styles.bankDetails}>
                        <h3>Bank Details</h3>
                        <div className={styles.detailGrid}>
                            <p>
                                <strong>Bank Name:</strong>{" "}
                                {report.data.Details.name}
                            </p>
                            <p>
                                <strong>Account Number:</strong>{" "}
                                {report.data.Details.accountNumber}
                            </p>
                            <p>
                                <strong>Registered On:</strong>{" "}
                                {formatDate(report.data.Details.createdAt)}
                            </p>
                            <p>
                                <strong>Last Updated:</strong>{" "}
                                {formatDate(report.data.Details.updatedAt)}
                            </p>
                        </div>
                    </div>

                    {report.data.Details.clearedReceipts?.length > 0 ? (
                        <div className={styles.receiptsSection}>
                            <h3>Cleared Receipts</h3>
                            <table className={styles.detailsTable}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Mode</th>
                                        <th>Transaction</th>
                                        <th>Flat Details</th>
                                        <th>Customer</th>
                                        <th>CGST</th>
                                        <th>SGST</th>
                                        <th>Cleared On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.data.Details.clearedReceipts.map(
                                        (clearedReceipt: ClearedReceipt) => (
                                            <tr key={clearedReceipt.receiptId}>
                                                <td>
                                                    {formatDate(
                                                        clearedReceipt.receipt
                                                            .dateIssued
                                                    )}
                                                </td>
                                                <td>
                                                    {formatIndianCurrencyWithDecimals(
                                                        clearedReceipt.receipt
                                                            .amount
                                                    )}
                                                </td>
                                                <td>
                                                    {
                                                        clearedReceipt.receipt
                                                            .mode
                                                    }
                                                </td>
                                                <td>
                                                    {clearedReceipt.receipt
                                                        .transactionNumber ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {clearedReceipt.receipt.sale
                                                        ?.flat ? (
                                                        <>
                                                            {
                                                                clearedReceipt
                                                                    .receipt
                                                                    .sale.flat
                                                                    .name
                                                            }{" "}
                                                            (Floor:{" "}
                                                            {
                                                                clearedReceipt
                                                                    .receipt
                                                                    .sale.flat
                                                                    .floorNumber
                                                            }
                                                            , Facing:{" "}
                                                            {
                                                                clearedReceipt
                                                                    .receipt
                                                                    .sale.flat
                                                                    .facing
                                                            }
                                                            )
                                                        </>
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </td>
                                                <td>
                                                    {clearedReceipt.receipt.sale
                                                        ?.companyCustomer ? (
                                                        <>
                                                            {
                                                                clearedReceipt
                                                                    .receipt
                                                                    .sale
                                                                    .companyCustomer
                                                                    .name
                                                            }{" "}
                                                            (PAN:{" "}
                                                            {
                                                                clearedReceipt
                                                                    .receipt
                                                                    .sale
                                                                    .companyCustomer
                                                                    .companyPan
                                                            }
                                                            )
                                                        </>
                                                    ) : clearedReceipt.receipt
                                                          .sale?.owners
                                                          ?.length ? (
                                                        <>
                                                            {clearedReceipt.receipt.sale.owners.map(
                                                                (
                                                                    owner,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            owner.id ||
                                                                            index
                                                                        }
                                                                    >
                                                                        {
                                                                            owner.firstName
                                                                        }{" "}
                                                                        {
                                                                            owner.lastName
                                                                        }
                                                                        {owner.panNumber && (
                                                                            <>
                                                                                {" "}
                                                                                (PAN:{" "}
                                                                                {
                                                                                    owner.panNumber
                                                                                }
                                                                                )
                                                                            </>
                                                                        )}
                                                                        {owner.aadharNumber && (
                                                                            <>
                                                                                {" "}
                                                                                (Aadhar
                                                                                Number:{" "}
                                                                                {
                                                                                    owner.aadharNumber
                                                                                }
                                                                                )
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </>
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </td>

                                                <td>
                                                    {formatIndianCurrencyWithDecimals(
                                                        clearedReceipt.receipt
                                                            .cgst
                                                    )}
                                                </td>
                                                <td>
                                                    {formatIndianCurrencyWithDecimals(
                                                        clearedReceipt.receipt
                                                            .sgst
                                                    )}
                                                </td>
                                                <td>
                                                    {formatDate(
                                                        clearedReceipt.createdAt
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.noData}>
                            No cleared receipts found for this bank.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Page;
