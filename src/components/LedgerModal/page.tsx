"use client";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ReceiptDoc from "@/components/Ledger/page";
import styles from "./ReceiptDocModal.module.scss";

interface bank {
    accountNumber: string;
    createdAt: string;
    id: string;
    name: string;
    orgId: string;
    societyId: string;
}
interface cleared {
    bank: bank;
    bankId: string;
    receiptId: string;
}
interface SingleReceipt {
    amount: string;
    bankName?: string;
    cgst: string;
    cleared?: cleared;
    failed: boolean;
    createdAt: string;
    dateIssued: string;
    id: string;
    mode: string;
    saleId: string;
    sgst: string;
    totalAmount: string;
    transactionNumber: string;
}

interface LedgerProps {
    receipt: SingleReceipt[];
    saleNumber: string;
    customerId: string;
    name: string;
    phone: string;
    amount: number;
    amountRemaining: number;
    bookingDate: string;
    superArea: number;
    floor: string;
    tower: string;
    project: string;
    plotNo: string;
}

const LedgerModal = ({ receiptData }: { receiptData: LedgerProps }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <button className={styles.viewReceiptButton} onClick={handleOpen}>
                Show Ledger
            </button>
            <Modal open={open} onClose={handleClose}>
                <Box className={styles.modalContent}>
                    {receiptData.receipt.length > 0 ? (
                        <ReceiptDoc
                            receiptData={receiptData}
                            onClose={handleClose}
                        />
                    ) : (
                        <p>No receipts available.</p>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default LedgerModal;
