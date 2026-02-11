// components/Receipts/EditReceiptForm.tsx
"use client";
import React, { useState } from "react";
import styles from "./page.module.scss";
import { updateSaleReceipt } from "@/redux/action/org-admin";
import toast from "react-hot-toast";

interface Receipt {
    id: string;
    receiptNumber: string;
    totalAmount: number | string;
    amount: number | string;
    mode: string;
    dateIssued: string;
    bankName?: string;
    transactionNumber?: string;
    cgst?: number | string;
    sgst?: number | string;
    serviceTax?: number | string;
    swatchBharatCess?: number | string;
    krishiKalyanCess?: number | string;
}

interface EditReceiptFormProps {
    rera: string;
    receipt: Receipt;
    onSuccess: () => void;
    onCancel: () => void;
}

const GST_DATE = new Date("2017-07-01");

const EditReceiptForm: React.FC<EditReceiptFormProps> = ({
    rera,
    receipt,
    onSuccess,
    onCancel,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        receiptNumber: receipt.receiptNumber || "",
        totalAmount: Number(receipt.totalAmount) || 0,
        mode: receipt.mode || "online",
        bankName: receipt.bankName || "",
        transactionNumber: receipt.transactionNumber || "",
        gstRate: 5,
        serviceTax: receipt.serviceTax ? Number(receipt.serviceTax) : 0,
        swatchBharatCess: receipt.swatchBharatCess ? Number(receipt.swatchBharatCess) : 0,
        krishiKalyanCess: receipt.krishiKalyanCess ? Number(receipt.krishiKalyanCess) : 0,
    });

    const dateIssued = new Date(receipt.dateIssued);
    const isPreGST = dateIssued < GST_DATE;

    const requiresBankDetails = ["online", "cheque", "demand-draft"].includes(
        formData.mode
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "totalAmount" ||
                name === "gstRate" ||
                name === "serviceTax" ||
                name === "swatchBharatCess" ||
                name === "krishiKalyanCess"
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.receiptNumber || formData.totalAmount <= 0) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (
            requiresBankDetails &&
            (!formData.bankName || !formData.transactionNumber)
        ) {
            toast.error(
                "Bank name and transaction number are required for this mode."
            );
            return;
        }

        if (
            isPreGST &&
            formData.mode !== "adjustment" &&
            formData.serviceTax === 0 &&
            formData.swatchBharatCess === 0 &&
            formData.krishiKalyanCess === 0
        ) {
            toast.error(
                "Service Tax, Swatch Bharat Cess, or Krishi Kalyan Cess is required for pre-GST receipts."
            );
            return;
        }

        setLoading(true);

        const payload: {
            receiptNumber: string;
            totalAmount: number;
            mode: string;
            bankName?: string;
            transactionNumber?: string;
            gstRate?: number;
            ServiceTax?: number;
            SwatchBharatCess?: number;
            KrishiKalyanCess?: number;
        } = {
            receiptNumber: formData.receiptNumber,
            totalAmount: formData.totalAmount,
            mode: formData.mode,
            bankName: formData.bankName,
            transactionNumber: formData.transactionNumber,
        };

        if (isPreGST) {
            payload.ServiceTax = formData.serviceTax;
            payload.SwatchBharatCess = formData.swatchBharatCess;
            payload.KrishiKalyanCess = formData.krishiKalyanCess;
        } else {
            payload.gstRate = formData.gstRate;
        }

        const response = await updateSaleReceipt(rera, receipt.id, payload);

        if (response?.error) {
            toast.error(response.message || "Failed to update receipt.");
        } else {
            toast.success("Receipt updated successfully!");
            onSuccess();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formHeading}>Edit Receipt</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "1rem" }}>
                Date Issued: {dateIssued.toLocaleDateString()}
                {isPreGST ? " (Pre-GST)" : " (Post-GST)"}
            </p>

            <div className={styles.formGroup}>
                <label>Receipt Number *</label>
                <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    className={styles.formControl}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Total Amount *</label>
                <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className={styles.formControl}
                    step="0.01"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Mode *</label>
                <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className={styles.formControl}
                    required
                >
                    <option value="online">Online</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="demand-draft">Demand Draft</option>
                    <option value="adjustment">Adjustment</option>
                </select>
            </div>

            {requiresBankDetails && (
                <>
                    <div className={styles.formGroup}>
                        <label>Bank Name *</label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            className={styles.formControl}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Transaction Number *</label>
                        <input
                            type="text"
                            name="transactionNumber"
                            value={formData.transactionNumber}
                            onChange={handleChange}
                            className={styles.formControl}
                            required
                        />
                    </div>
                </>
            )}

            {!isPreGST && formData.mode !== "adjustment" && (
                <div className={styles.formGroup}>
                    <label>GST Rate</label>
                    <div className={styles.radioGroup}>
                        <label>
                            <input
                                type="radio"
                                name="gstRate"
                                value={1}
                                checked={formData.gstRate === 1}
                                onChange={handleChange}
                            />
                            1%
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gstRate"
                                value={5}
                                checked={formData.gstRate === 5}
                                onChange={handleChange}
                            />
                            5%
                        </label>
                    </div>
                </div>
            )}

            {isPreGST && formData.mode !== "adjustment" && (
                <>
                    <div className={styles.formGroup}>
                        <label>Service Tax</label>
                        <input
                            type="number"
                            name="serviceTax"
                            value={formData.serviceTax}
                            onChange={handleChange}
                            className={styles.formControl}
                            step="0.01"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Swatch Bharat Cess</label>
                        <input
                            type="number"
                            name="swatchBharatCess"
                            value={formData.swatchBharatCess}
                            onChange={handleChange}
                            className={styles.formControl}
                            step="0.01"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Krishi Kalyan Cess</label>
                        <input
                            type="number"
                            name="krishiKalyanCess"
                            value={formData.krishiKalyanCess}
                            onChange={handleChange}
                            className={styles.formControl}
                            step="0.01"
                        />
                    </div>
                </>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={{ backgroundColor: "#6c757d" }}
                >
                    Cancel
                </button>
                <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Receipt"}
                </button>
            </div>
        </form> 
    );
};

export default EditReceiptForm;