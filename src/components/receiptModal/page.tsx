"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./page.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatIndianCurrencyWithDecimals } from "@/utils/formatIndianCurrencyWithDecimals";
import { useRouter } from "next/navigation";
import { clearSaleReceipt, getAllSocietyBanks } from "@/redux/action/org-admin";
import toast from "react-hot-toast";
import Spinner from "react-bootstrap/Spinner";

const ReceiptContent = ({
  id,
  rera,
  handleClose,
  fetchData,
}: {
  id: string;
  rera: string;
  handleClose: () => void;
  fetchData: () => void;
}) => {
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null
  );
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [banks, setBanks] = useState<
    { id: string; name: string; accountNumber: string }[]
  >([]);

  const units = useSelector((state: RootState) => state.Society.units);
  const matchingUnit = units.find((unit) => unit.saleDetail?.id === id);
  const receipts = matchingUnit?.saleDetail?.receipts || [];
  const router = useRouter();

  useEffect(() => {
    setPageLoading(false); // simulate async page preparation if needed
  }, []);

  const fetchAllBanks = async (
    cursor: string | null = null,
    accumulated: any[] = []
  ): Promise<any[]> => {
    const response = await getAllSocietyBanks(rera, cursor);
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

  const handleClearClick = async (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setClearModalOpen(true);
    setSelectedBankId("");
    setErrorMsg("");

    const fetchedBanks = await fetchAllBanks();
    setBanks(fetchedBanks);
  };

  const handleDone = async () => {
    if (!selectedBankId || !selectedReceiptId) {
      setErrorMsg("Please select a bank.");
      return;
    }

    setLoading(true);
    const response = await clearSaleReceipt(
      rera,
      selectedReceiptId,
      selectedBankId
    );
    if (response?.error) {
      setErrorMsg(response.message || "Failed to clear receipt.");
    } else {
      setClearModalOpen(false);
      toast.success("Receipt cleared successfully.");
      fetchData();
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className={styles.loader}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Receipts</h1>
      <button
        className={styles.createButton}
        onClick={() =>
          router.push(
            `/org-admin/society/flats/create-receipt?rera=${rera}&saleId=${id}`
          )
        }
      >
        Create Receipt
      </button>
      <button className={styles.closeButton} onClick={handleClose}>
        ✕
      </button>

      {receipts.length === 0 ? (
        <p>No receipts available.</p>
      ) : (
        <div className={styles.grid}>
          {receipts.map((receipt) => (
            <div key={receipt.id} className={styles.card}>
              <p>
                <strong>Receipt Number:</strong> {receipt.id}
              </p>
              <p>
                <strong>Date Issued:</strong>{" "}
                {new Date(receipt.dateIssued).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.amount)}
              </p>
              <p>
                <strong>Mode:</strong> {receipt.mode}
              </p>
              <p>
                <strong>Transaction Number:</strong>{" "}
                {receipt.transactionNumber || "N/A"}
              </p>
              <p>
                <strong>Bank Name:</strong> {receipt.bankName || "N/A"}
              </p>
              <p>
                <strong>CGST:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.cgst)}
              </p>
              <p>
                <strong>SGST:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.sgst)}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                {formatIndianCurrencyWithDecimals(receipt.totalAmount)}
              </p>
              {receipt.cleared && (
                <div className={styles.clearedInfo}>
                  <p>
                    <strong>Cleared via:</strong>
                  </p>
                  <div>
                    <p>
                      <strong>Bank Name:</strong> {receipt.cleared.bank.name}
                    </p>
                    <p>
                      <strong>Account Number:</strong>{" "}
                      {receipt.cleared.bank.accountNumber}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.buttonGroup}>
                {!receipt.cleared && (
                  <button
                    className={styles.clearButton}
                    onClick={() => handleClearClick(receipt.id)}
                  >
                    Clear Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)}>
        <Box className={styles.modal2}>
          <h3>Select Bank to Clear Receipt</h3>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className={styles.select}
          >
            <option value="">Select a bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} {bank.accountNumber}
              </option>
            ))}
          </select>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <div className={styles.buttonGroup}>
            <button
              onClick={() => setClearModalOpen(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
            <button
              onClick={handleDone}
              className={styles.paidButton}
              disabled={loading}
            >
              {loading ? "Clearing..." : "Done"}
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

interface ReceiptModalProps {
  id: string;
  rera: string;
  fetchData: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ id, rera, fetchData }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <button onClick={handleOpen} className={styles.button}>
        View Receipts
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box className={styles.modal}>
          <ReceiptContent
            id={id}
            rera={rera}
            handleClose={handleClose}
            fetchData={fetchData}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ReceiptModal;
