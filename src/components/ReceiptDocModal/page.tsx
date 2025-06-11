"use client";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ReceiptDoc from "@/components/ReceiptDoc/page";
import styles from "./ReceiptDocModal.module.scss"; // create this SCSS file as needed

interface ReceiptData {
  receiptNo: string;
  customerId: string;
  name: string;
  address: string;
  phone: string;
  date: string;
  amount: number;
  cgst: number;
  sgst: number;
  total: number;
  superArea: number;
balconyArea: number;
  reraCarpetArea: number;
  area: number;
  floor: string;
  tower: string;
  project: string;
  plotNo: string;
  bankName: string;
  instrumentDate: string;
  status: string;
  mode: string;
}

const ReceiptDocModal = ({ receiptData }: { receiptData: ReceiptData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <button className={styles.viewReceiptButton} onClick={handleOpen}>
        View Receipt
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modalContent}>
          <ReceiptDoc receiptData={receiptData} onClose={handleClose} />
        </Box>
      </Modal>
    </>
  );
};

export default ReceiptDocModal;
